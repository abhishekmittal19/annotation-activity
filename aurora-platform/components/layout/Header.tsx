"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <Search size={18} className="text-slate-500" />

        <input
          type="text"
          placeholder="Search tasks, users, datasets..."
          className="w-80 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="h-6 w-px bg-slate-800" />

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800"
        >
          <UserCircle size={28} className="text-slate-400" />

          <div className="text-left">
            <p className="text-xs font-medium text-slate-200">Abhishek</p>

            <p className="text-[10px] text-slate-500">Annotator</p>
          </div>
        </button>
      </div>
    </header>
  );
}
