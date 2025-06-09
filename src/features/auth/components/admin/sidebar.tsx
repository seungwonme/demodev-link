"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon,
  LinkIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";
import { signOut } from "@/features/auth/actions/auth";
import { UserRole } from "@/features/auth/types/profile";

interface AdminSidebarProps {
  userRole: UserRole;
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      name: "대시보드",
      href: "/admin/dashboard",
      icon: HomeIcon,
      roles: ["user", "admin"],
    },
    {
      name: "링크 관리",
      href: "/admin/links",
      icon: LinkIcon,
      roles: ["user", "admin"],
    },
    {
      name: "분석",
      href: "/admin/analytics",
      icon: ChartBarIcon,
      roles: ["user", "admin"],
    },
    {
      name: "사용자 관리",
      href: "/admin/users",
      icon: UsersIcon,
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          DemoDev Admin
        </h2>
      </div>
      
      <nav className="mt-6">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <form action={handleLogout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}