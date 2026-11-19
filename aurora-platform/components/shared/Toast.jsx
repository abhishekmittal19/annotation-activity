"use client";

import { useEffect } from "react";

export function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isError = type === "error";

  return (
    <div className="fixed right-5 top-5 z-[9999] animate-in slide-in-from-right duration-300">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md ${
          isError
            ? "border-red-500/30 bg-slate-900"
            : "border-emerald-500/30 bg-slate-900"
        }`}
      >
        <span
          className={`text-xl ${isError ? "text-red-400" : "text-emerald-400"}`}
        >
          {isError ? "⚠" : "✓"}
        </span>

        <p className="text-sm font-medium text-white">{message}</p>

        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
