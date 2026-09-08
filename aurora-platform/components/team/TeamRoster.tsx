'use client';

import React, { useState } from 'react';
import { MOCK_USERS } from '@/lib/api/mockData';
import { UserRole } from '@/types/auth';
import { Users, Shield, Award, CheckSquare, Zap, Filter } from 'lucide-react';

export function TeamRoster() {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredUsers = MOCK_USERS.filter(
    (u) => selectedRole === 'ALL' || u.role === selectedRole
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            AnnotOps Personnel & Team Workload Balancing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Role roster, individual accuracy ratings, and active workload capacity.
          </p>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Roles (4)</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="ANNOTATOR">Annotator</option>
            <option value="REVIEWER">Reviewer</option>
          </select>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{user.name}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 uppercase">
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Accuracy Index</span>
                <span className="font-bold text-emerald-400">{user.accuracyRate || 98.0}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Active Workload</span>
                <span className="font-bold text-cyan-300">{user.activeWorkload || 0} Tasks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
