"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
        <DropdownMenuLabel className="dark:text-slate-100">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem 
          onClick={() => router.push("/settings")}
          className="dark:text-slate-300 dark:focus:bg-slate-700"
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/history")}
          className="dark:text-slate-300 dark:focus:bg-slate-700"
        >
          History
        </DropdownMenuItem>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="dark:text-slate-300 dark:focus:bg-slate-700"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}