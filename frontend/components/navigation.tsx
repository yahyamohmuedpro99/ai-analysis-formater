"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, History, Settings } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Playground", href: "/playground", icon: LayoutDashboard },
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex space-x-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            variant={pathname === item.href ? "default" : "ghost"}
            className={`${pathname === item.href
              ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              : "text-gray-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
            asChild
          >
            <Link href={item.href} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}