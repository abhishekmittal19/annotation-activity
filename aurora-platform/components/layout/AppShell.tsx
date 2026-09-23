"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Responsive Sidebar (Mobile drawer, Tablet compact, Desktop expanded) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area with dynamic responsive padding */}
      <div className="min-h-screen pl-0 md:pl-16 xl:pl-64 transition-all duration-200">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="w-full px-3 py-4 sm:px-4 md:px-6 xl:px-8">
          <div className="mx-auto w-full max-w-[1800px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}