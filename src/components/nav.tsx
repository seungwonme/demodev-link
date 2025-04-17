"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import AuthStatus from "./auth-status";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchUser();
  }, []);

  // 프로필 링크 클릭 핸들러
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            DemoLink
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              홈
            </Link>
            <Link
              href="/analytics"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              분석
            </Link>
            <Link
              href="/profile"
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                !user ? "opacity-50" : ""
              }`}
              onClick={handleProfileClick}
            >
              프로필
            </Link>
            <AuthStatus />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">테마 변경</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">메뉴 열기</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:hidden border-t border-gray-200 py-2`}
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              홈
            </Link>
            <Link
              href="/analytics"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              분석
            </Link>
            <Link
              href="/profile"
              className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground ${
                !user ? "opacity-50" : ""
              }`}
              onClick={(e) => {
                setIsOpen(false);
                handleProfileClick(e);
              }}
            >
              프로필
            </Link>
            <div className="px-3 py-2">
              <AuthStatus />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setIsOpen(false);
              }}
            >
              <SunIcon className="mr-2 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              테마 변경
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
