"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Link2,
  BarChart3,
  Users,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { UserRole } from "@/features/auth/services/clerk-auth.service";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";

interface AdminSidebarProps {
  userRole: UserRole;
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const menuItems = [
    {
      name: "대시보드",
      href: "/admin/dashboard",
      icon: Home,
      roles: ["user", "admin"],
    },
    {
      name: "링크 관리",
      href: "/admin/links",
      icon: Link2,
      roles: ["user", "admin"],
    },
    {
      name: "분석",
      href: "/admin/analytics",
      icon: BarChart3,
      roles: ["user", "admin"],
    },
    {
      name: "사용자 관리",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Link2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">DemoLink</span>
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-accent/50"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 h-screen bg-card/95 backdrop-blur-sm border-r border-border/50",
        "fixed left-0 top-0 z-40"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">DemoLink</span>
              <p className="text-xs text-muted-foreground">관리자 패널</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.name}
                {active && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
          
          {userRole === "admin" && (
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link
                href="/admin/settings"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive("/admin/settings")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <Settings className="h-5 w-5" />
                설정
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 space-y-4 border-t border-border/50">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">테마</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* Clerk User Button */}
          <div className="px-4 py-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                    userButtonTrigger: "focus:shadow-none"
                  }
                }}
                showName
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {userRole === "admin" ? "전체 권한" : "일반 권한"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <aside className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-card/95 backdrop-blur-sm border-r border-border/50 transition-transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-primary")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-card/95">
            <div className="flex items-center gap-3 px-2 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                    userButtonTrigger: "focus:shadow-none"
                  }
                }}
                showName
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {userRole === "admin" ? "전체 권한" : "일반 권한"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}