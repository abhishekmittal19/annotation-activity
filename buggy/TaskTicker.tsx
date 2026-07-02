import React, { useEffect, useState } from "react";

type Task = { id: string; title: string; updatedAt: number };

export function TaskTicker({ apiBase }: { apiBase: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // (A) Fix: Use functional state updater to avoid capturing a stale 'tick' closure
  useEffect(() => {
    const id = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // (B) Fix: Guard against null ID, handle race conditions with AbortController, prevent state mutations
  useEffect(() => {
    if (!selectedId) return;

    const controller = new AbortController();

    fetch(`${apiBase}/api/tasks/${selectedId}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch task: ${r.status}`);
        }
        return r.json();
      })
      .then((t) => {
        // Normalize timestamp from mock server if mixed format
        const parsedTime = typeof t.updatedAt === 'string' 
          ? Date.parse(t.updatedAt) 
          : typeof t.updatedAt === 'number' 
            ? (t.updatedAt < 50000000000 ? t.updatedAt * 1000 : t.updatedAt)
            : Date.now();

        const normalizedTask: Task = {
          id: t.id,
          title: t.title,
          updatedAt: parsedTime
        };

        setTasks((prev) => {
          // Fix: Prevent mutating the original state array; return a new array copy
          // Also, let's prevent adding duplicate tasks to the ticker list
          const filtered = prev.filter((item) => item.id !== normalizedTask.id);
          return [...filtered, normalizedTask];
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[TaskTicker Error]', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [apiBase, selectedId]);

  // (C) Fix: Prevent in-place mutation of the tasks array by using a shallow copy [...tasks]
  const sorted = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <ul className="space-y-1 bg-slate-900 border border-slate-800 p-4 rounded-lg">
      {sorted.map((t) => (
        // Fix: Use unique task ID as key instead of array index 'i'
        <li 
          key={t.id} 
          onClick={() => setSelectedId(t.id)}
          className={`cursor-pointer px-3 py-1.5 rounded transition-all text-xs flex justify-between items-center
                      ${selectedId === t.id ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-400'}`}
        >
          <span>{t.title}</span>
          <span className="font-mono text-[10px] text-slate-500">
            {/* Added defensive check for calculation in case tick changes but Date.now() doesn't re-render ticker */}
            updated {Math.max(0, Math.floor((Date.now() - t.updatedAt) / 1000))}s ago
          </span>
        </li>
      ))}
    </ul>
  );
}
