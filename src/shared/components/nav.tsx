"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, UserButton } from "@clerk/nextjs";

// NavigationContent 컴포넌트를 별도로 분리
function NavigationContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin/login", label: "Admin", icon: Shield },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-border/50"
          : "bg-transparent border-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            DemoLink
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground px-4 py-2 rounded-full",
                      isActive
                        ? "text-foreground bg-secondary/80"
                        : "text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-border/50 h-6">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle Theme</span>
              </Button>

              {/* User Button or CTA */}
              {isLoaded && (
                isSignedIn ? (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                        userButtonTrigger: "focus:shadow-none"
                      }
                    }}
                  />
                ) : (
                  <Button
                    size="sm"
                    className="h-9 px-5 rounded-full font-medium shadow-sm"
                    asChild
                  >
                    <Link href="/admin/register">
                      시작하기
                    </Link>
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <span className="sr-only">Menu</span>
              {isOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100 border-t border-border/50" : "max-h-0 opacity-0",
          )}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {isLoaded && (
              <div className="pt-4 mt-2 px-4">
                {isSignedIn ? (
                  <div className="flex items-center gap-3">
                    <UserButton showName />
                  </div>
                ) : (
                  <Button
                    className="w-full rounded-full"
                    asChild
                  >
                    <Link href="/admin/register" onClick={() => setIsOpen(false)}>
                      시작하기
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Navigation() {
  const pathname = usePathname();

  // 관리자 페이지에서는 네비게이션 바를 숨김 (특정 페이지는 제외)
  const showNavOnAdminPages = [
    "/admin/login",
    "/admin/register",
    "/admin/pending",
    "/admin/rejected",
  ];

  const isAdminPage =
    pathname?.startsWith("/admin") && !showNavOnAdminPages.includes(pathname);

  // early return을 hooks 호출 후에 하도록 수정
  if (isAdminPage) {
    return null;
  }

  return <NavigationContent />;
}
