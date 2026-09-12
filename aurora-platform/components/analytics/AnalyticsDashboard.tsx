'use client';

import React, { useState } from 'react';
import { MOCK_METRICS } from '@/lib/api/mockData';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  const throughputData = [
    { date: 'Aug 01', completed: 120, rejected: 12 },
    { date: 'Aug 02', completed: 180, rejected: 14 },
    { date: 'Aug 03', completed: 240, rejected: 18 },
    { date: 'Aug 04', completed: 310, rejected: 10 },
    { date: 'Aug 05', completed: 420, rejected: 15 },
    { date: 'Aug 06', completed: 490, rejected: 22 },
    { date: 'Aug 07', completed: 580, rejected: 19 },
  ];

  const rejectionReasonData = [
    { reason: 'Loose Box', count: 184 },
    { reason: 'Wrong Class', count: 92 },
    { reason: 'Missed Object', count: 68 },
    { reason: 'Attributes Error', count: 42 },
    { reason: 'Noise/Artifact', count: 34 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            AnnotOps Analytics & Quality Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive operational metrics, reviewer agreement heatmaps, and cycle-time bottlenecks.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          {['today', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                timeRange === range
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Total Completed Annotations</span>
          <p className="text-2xl font-extrabold text-slate-100">{MOCK_METRICS.completedCount.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 font-medium">+15.2% vs last month</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Quality Index (Score)</span>
          <p className="text-2xl font-extrabold text-emerald-400">98.4 / 100</p>
          <p className="text-xs text-slate-400">First-pass accuracy</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Rejection Defect Rate</span>
          <p className="text-2xl font-extrabold text-rose-400">{MOCK_METRICS.rejectionRate}%</p>
          <p className="text-xs text-emerald-400">-0.8% MoM improvement</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Mean Annotation Time</span>
          <p className="text-2xl font-extrabold text-cyan-300">{MOCK_METRICS.avgAnnotationTimeMinutes}m</p>
          <p className="text-xs text-slate-400">MTTR Review: {MOCK_METRICS.avgReviewTimeMinutes}m</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Task Throughput Area Chart */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Annotation Throughput Volume
          </h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rejection Reason Breakdown */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Rejection Defect Taxonomy Breakdown
          </h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rejectionReasonData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="reason" type="category" stroke="#64748B" fontSize={11} width={100} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#F43F5E" radius={[0, 4, 4, 0]} name="Defects Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
