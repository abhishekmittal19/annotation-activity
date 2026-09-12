'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { Settings, User, Bell, Sliders, Palette, CheckCircle2 } from 'lucide-react';

export function SettingsView() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'workspace'>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Workspace & Persona Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure authentication, notification alerts, and annotation workspace defaults.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Account</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications & Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Workspace Preferences</span>
        </button>
      </div>

      {/* Tab Content Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || 'Sarah Connor'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || 'admin@aurora.ai'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Active Role</label>
              <input
                type="text"
                disabled
                value={user?.role || 'ADMIN'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-slate-500 font-bold"
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-700 text-cyan-600" />
              <span>Email notification when assigned to a new task</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-700 text-cyan-600" />
              <span>Instant toast notification on QA rejection / rework request</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-700 text-cyan-600" />
              <span>SLA deadline warning alerts (24 hours before breach)</span>
            </label>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Default Zoom Level</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200">
                <option value="100">100% (Original Image)</option>
                <option value="125">125% Zoom</option>
                <option value="150">150% Zoom</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-700 text-cyan-600" />
              <span>Enable Auto-save interval every 30 seconds</span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {saved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
