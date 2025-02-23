'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center gap-3">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search..." 
              className="w-full pl-9"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </button>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
