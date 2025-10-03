"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Playground", href: "/playground" },
    { name: "History", href: "/history" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 dark:bg-slate-900">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-slate-100">Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-lg font-medium transition-colors ${
                pathname === item.href
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}