"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-64">
        <Header />

        <main className="w-full px-3 py-4 sm:px-4 md:px-6 lg:px-6 xl:px-8">
          <div className="mx-auto w-full max-w-[1800px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
