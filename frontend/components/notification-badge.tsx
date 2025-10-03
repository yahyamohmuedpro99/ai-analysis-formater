"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBadge() {
  // In a real app, this would come from context or state
  const notificationCount = 3;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-700 hover:bg-slate-100 dark:text-white dark:hover:bg-white/20 relative"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4 dark:bg-slate-800 dark:border-slate-700" align="end">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-sm dark:text-slate-100">Notifications</h3>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🚧</div>
              <h4 className="font-medium text-sm mb-1 dark:text-slate-200">Under Development</h4>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Notifications feature is not implemented yet. This is for future development.
              </p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
