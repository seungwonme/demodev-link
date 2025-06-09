import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Middleware - Path:", requestUrl.pathname, "User:", user?.email || "none");

  // Admin routes protection
  if (requestUrl.pathname.startsWith("/admin")) {
    // Public admin pages that don't require authentication
    const publicAdminPaths = ["/admin/login", "/admin/register"];
    const isPublicAdminPath = publicAdminPaths.some(path => 
      requestUrl.pathname === path
    );

    // Special pages that require auth but have special handling
    const specialAdminPaths = ["/admin/pending", "/admin/rejected"];
    const isSpecialAdminPath = specialAdminPaths.some(path => 
      requestUrl.pathname === path
    );

    // If not a public path, require authentication
    if (!isPublicAdminPath) {
      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // For authenticated users, check profile status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .single();
      
      console.log("Middleware - Profile query result:", { profile, error: profileError });

      // For special pages, allow access but still check status
      if (!isSpecialAdminPath) {
        // Redirect based on user status
        if (profile?.status === "pending") {
          return NextResponse.redirect(new URL("/admin/pending", request.url));
        }

        if (profile?.status === "rejected") {
          return NextResponse.redirect(new URL("/admin/rejected", request.url));
        }

        // Only allow approved users to access regular admin pages
        if (profile?.status !== "approved") {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      }

      // Admin-only routes
      const adminOnlyPaths = ["/admin/users"];
      const isAdminOnlyPath = adminOnlyPaths.some(path => 
        requestUrl.pathname.startsWith(path)
      );

      if (isAdminOnlyPath && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  // Redirect authenticated users from admin login/register to dashboard
  if (user && (requestUrl.pathname === "/admin/login" || requestUrl.pathname === "/admin/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "approved") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (profile?.status === "pending") {
      return NextResponse.redirect(new URL("/admin/pending", request.url));
    } else if (profile?.status === "rejected") {
      return NextResponse.redirect(new URL("/admin/rejected", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
