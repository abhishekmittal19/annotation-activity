"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/store";
import { logout } from "@/store/authSlice";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear Redux authentication state
      dispatch(logout());

      // Close menu
      setIsUserMenuOpen(false);

      // Redirect to login
      router.replace("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      {/* =========================
          LEFT SIDE
      ========================== */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white xl:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="flex min-w-0 max-w-xl flex-1 items-center gap-2">
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

      {/* =========================
          RIGHT SIDE
      ========================== */}
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

        {/* =========================
            USER MENU
        ========================== */}
        <div ref={userMenuRef} className="relative">
          {/* User button */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-800"
          >
            <UserCircle size={28} className="shrink-0 text-slate-400" />

            {/* User information */}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-slate-200">Abhishek</p>

              <p className="text-[10px] text-slate-500">Annotator</p>
            </div>
          </button>

          {/* =========================
              DROPDOWN
          ========================== */}
          {isUserMenuOpen && (
            <div
              role="menu"
              className="
                absolute
                right-0
                top-full
                mt-2
                w-48
                overflow-hidden
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                shadow-2xl
              "
            >
              {/* Account information */}
              <div className="border-b border-slate-800 px-4 py-3">
                <p className="text-sm font-medium text-slate-200">Abhishek</p>

                <p className="mt-1 text-xs text-slate-500">Annotator</p>
              </div>

              {/* Logout */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-left
                  text-sm
                  text-slate-300
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <LogOut size={17} />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
