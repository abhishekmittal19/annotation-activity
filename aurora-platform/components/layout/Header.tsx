"use client";

import { Bell, Menu, Search, UserCircle } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-3 sm:px-4 lg:px-6 backdrop-blur">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="flex min-w-0 flex-1 max-w-xl items-center gap-2">
          <Search size={18} className="shrink-0 text-slate-500" />

          <input
            type="text"
            placeholder="Search tasks, users, datasets..."
            className="
              min-w-0
              w-full
              bg-transparent
              text-sm
              text-slate-200
              outline-none
              placeholder:text-slate-600
            "
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-slate-800 sm:block" />

        {/* User */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-800"
        >
          <UserCircle size={28} className="shrink-0 text-slate-400" />

          {/* Hide text on very small screens */}
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-slate-200">Abhishek</p>

            <p className="text-[10px] text-slate-500">Annotator</p>
          </div>
        </button>
      </div>
    </header>
  );
}
