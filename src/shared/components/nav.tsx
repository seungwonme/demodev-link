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
  LogIn
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  
  // 관리자 페이지에서는 네비게이션 바를 숨김
  const isAdminPage = pathname?.startsWith('/admin') && 
                      !pathname.includes('/login') && 
                      !pathname.includes('/register') &&
                      !pathname.includes('/pending') &&
                      !pathname.includes('/rejected');
  
  if (isAdminPage) {
    return null;
  }

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
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">DemoLink</span>
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
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="ml-4 flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg hover:bg-accent/50"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">테마 변경</span>
              </Button>
              
              {/* CTA Button */}
              <Button size="sm" className="hidden lg:flex hover-lift" asChild>
                <Link href="/admin/register">
                  <Sparkles className="mr-2 h-4 w-4" />
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
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="pt-3 mt-3 border-t border-border/50">
              <Button className="w-full hover-lift" asChild>
                <Link href="/admin/register" onClick={() => setIsOpen(false)}>
                  <Sparkles className="mr-2 h-4 w-4" />
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