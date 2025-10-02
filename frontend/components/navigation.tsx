"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "History", href: "/history" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <nav className="flex space-x-2">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          className={`${pathname === item.href 
            ? "bg-white text-purple-600 hover:bg-slate-100 dark:bg-slate-200 dark:text-purple-800" 
            : "text-white hover:bg-white/20 dark:text-slate-200"
          }`}
          asChild
        >
          <Link href={item.href}>{item.name}</Link>
        </Button>
      ))}
    </nav>
  );
}