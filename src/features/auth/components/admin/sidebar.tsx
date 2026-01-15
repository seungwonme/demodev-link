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
  FileText,
  FolderKanban,
  Sparkles,
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
      name: "캠페인",
      href: "/admin/campaigns",
      icon: FolderKanban,
      roles: ["user", "admin"],
    },
    {
      name: "템플릿",
      href: "/admin/templates",
      icon: FileText,
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg text-foreground tracking-tight">DemoLink</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 transition-all duration-300",
        "bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-r border-white/20 dark:border-white/10",
        "shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]"
      )}>
        <div className="h-20 flex items-center px-6">
          <Link href="/" className="flex items-center gap-3 group w-full">
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-foreground tracking-tight leading-none">DemoLink</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Workspace</span>
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
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-white dark:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-primary ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                )}
              </Link>
            );
          })}

          {userRole === "admin" && (
            <div className="pt-6 mt-2">
              <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Settings</div>
              <Link
                href="/admin/settings"
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive("/admin/settings")
                    ? "bg-white dark:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-primary ring-1 ring-black/5 dark:ring-white/10"
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Settings className={cn("h-4.5 w-4.5 transition-colors", isActive("/admin/settings") ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                설정
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">테마 설정</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 w-7 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-white/50 dark:ring-white/10",
                  userButtonTrigger: "focus:shadow-none"
                }
              }}
              showName={false}
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-sm font-semibold text-foreground truncate block">관리자</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {userRole === "admin" ? "Pro Plan" : "Free Plan"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Mobile Sidebar Content */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 bg-background/95 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-out shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
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
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}