"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
  Workflow,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Annotation",
    href: "/annotation",
    icon: Workflow,
  },
  {
    name: "Review",
    href: "/review",
    icon: ClipboardCheck,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm xl:hidden"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer Sidebar (Sliding Drawer on Mobile / Tablet when opened) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out xl:hidden ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 font-bold text-slate-950">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-white">
                AURORA
              </h1>
              <p className="text-[10px] text-slate-500">AI ANNOTATION PLATFORM</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Aurora Platform
          </p>
          <p className="mt-1 text-xs text-slate-500">Annotation Operations</p>
        </div>
      </aside>

      {/* 3. Tablet Compact Sidebar (768px to 1279px - Icon Only) */}
      <aside className="hidden md:flex xl:hidden fixed inset-y-0 left-0 z-30 w-16 flex-col border-r border-slate-800 bg-slate-950">
        <div className="flex h-16 items-center justify-center border-b border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 font-bold text-slate-950">
            A
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex items-center justify-center rounded-lg p-2.5 text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 4. Desktop Full Sidebar (>= 1280px) */}
      <aside className="hidden xl:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-800 bg-slate-950">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 font-bold text-slate-950">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-white">
                AURORA
              </h1>
              <p className="text-[10px] text-slate-500">AI ANNOTATION PLATFORM</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Aurora Platform
          </p>
          <p className="mt-1 text-xs text-slate-500">Annotation Operations</p>
        </div>
      </aside>
    </>
  );
}
