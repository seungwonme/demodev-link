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
  Link2,
  Home,
  Shield,
  BarChart3,
  Sparkles,
  LogIn,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// NavigationContent 컴포넌트를 별도로 분리
function NavigationContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/admin/login", label: "관리자", icon: Shield },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "bg-background/70 backdrop-blur-2xl border-b border-primary/10 shadow-lg shadow-primary/5"
          : "bg-transparent backdrop-blur-sm",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-xl font-black hover:scale-105 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:rotate-12 transition-all duration-300">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-300% text-2xl">DemoLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg shadow-primary/20"
                      : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-primary to-accent rounded-full" />
                  )}
                </Link>
              );
            })}

            <div className="ml-4 flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-110"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">테마 변경</span>
              </Button>

              {/* CTA Button */}
              <Button 
                size="sm" 
                className="hidden lg:flex h-10 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/admin/register">
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  시작하기
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <span className="sr-only">메뉴 열기</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg shadow-primary/20"
                      : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-primary/10">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300" 
                asChild
              >
                <Link href="/admin/register" onClick={() => setIsOpen(false)}>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  시작하기
                </Link>
              </Button>
            </div>
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
