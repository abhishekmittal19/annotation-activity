'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
  loadCachedTasks, 
  fetchTasks, 
  selectPageSize 
} from '@/store/tasksSlice';
import { useTaskFeed } from '@/hooks/useTaskFeed';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { TaskMetrics } from './TaskMetrics';
import { Cpu } from 'lucide-react';

export default function TaskDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const pageSize = useSelector(selectPageSize);
  
  // Connect WebSocket live event feed
  const wsStatus = useTaskFeed();

  // Load cached tasks and trigger initial revalidation
  useEffect(() => {
    async function initDashboard() {
      console.log('[Dashboard] Initializing: loading IndexedDB cache...');
      // 1. Load IndexedDB cache immediately to render UI
      await dispatch(loadCachedTasks());
      
      console.log('[Dashboard] Cache loaded. Revalidating from API...');
      // 2. Revalidate by fetching fresh page 1 tasks from server
      dispatch(fetchTasks({ page: 1, pageSize }));
    }
    
    initDashboard();
  }, [dispatch, pageSize]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Header Panel */}
      <header className="border-b border-slate-900 bg-slate-900/30 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-650/20 border border-indigo-500/30 text-indigo-400 rounded-lg shadow-inner">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              Annotation Activity Console
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
              Operations Center • Workspace f:\predusk technology
            </p>
          </div>
        </div>

        {/* WebSocket Connection indicator */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-lg select-none">
            {wsStatus === 'connected' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">LIVE SYNC</span>
              </>
            ) : wsStatus === 'connecting' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">CONNECTING</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-xs font-bold text-rose-400 font-mono">SYNC DISCONNECTED</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Layout */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full flex flex-col">
        {/* Metrics Row */}
        <TaskMetrics />

        {/* Main interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
          {/* List panel */}
          <div className="lg:col-span-3 flex flex-col min-h-[500px]">
            <TaskList />
          </div>

          {/* Details / Summary panel */}
          <div className="lg:col-span-2 flex flex-col min-h-[500px]">
            <TaskDetail />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-3 text-center text-[10px] text-slate-600 font-mono select-none">
        Powered by Antigravity AI Coding Assistant • Next.js App Router v14
      </footer>
    </div>
  );
}
