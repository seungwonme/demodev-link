import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getUser() instead of getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const requestUrl = new URL(request.url);
  const protectedPaths = ["/analytics", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    requestUrl.pathname.startsWith(path),
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if accessing login page while authenticated
  if (requestUrl.pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}