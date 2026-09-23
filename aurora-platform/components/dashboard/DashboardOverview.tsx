"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import { TaskItem } from "@/types/task";
import { MOCK_METRICS } from "@/lib/api/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AlertTriangle,
  BarChart2,
  CheckSquare,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export function DashboardOverview() {
  const { data: taskResponse = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });
  const tasks = taskResponse?.items ?? [];

  const metrics = MOCK_METRICS;

  const productivityData = [
    { name: "Mon", annotated: 420, reviewed: 390 },
    { name: "Tue", annotated: 580, reviewed: 540 },
    { name: "Wed", annotated: 650, reviewed: 610 },
    { name: "Thu", annotated: 710, reviewed: 680 },
    { name: "Fri", annotated: 840, reviewed: 790 },
    { name: "Sat", annotated: 320, reviewed: 300 },
    { name: "Sun", annotated: 290, reviewed: 280 },
  ];

  const qualityTrendData = [
    { day: "Day 1", passRate: 91.2, rejectionRate: 6.8 },
    { day: "Day 2", passRate: 92.5, rejectionRate: 5.5 },
    { day: "Day 3", passRate: 93.8, rejectionRate: 4.9 },
    { day: "Day 4", passRate: 94.1, rejectionRate: 4.4 },
    { day: "Day 5", passRate: 94.8, rejectionRate: 4.2 },
  ];

  const pipelineStates = [
    {
      key: "PENDING",
      label: "Pending",
      count: metrics.pendingCount,
      color: "bg-slate-500",
    },
    {
      key: "ASSIGNED",
      label: "Assigned",
      count: metrics.assignedCount,
      color: "bg-indigo-500",
    },
    {
      key: "IN_PROGRESS",
      label: "In Progress",
      count: metrics.inProgressCount,
      color: "bg-cyan-500",
    },
    {
      key: "SUBMITTED",
      label: "Submitted",
      count: metrics.submittedCount,
      color: "bg-blue-500",
    },
    {
      key: "UNDER_REVIEW",
      label: "Under Review",
      count: metrics.underReviewCount,
      color: "bg-purple-500",
    },
    {
      key: "APPROVED",
      label: "Approved",
      count: metrics.approvedCount,
      color: "bg-emerald-500",
    },
    {
      key: "REJECTED",
      label: "Rejected",
      count: metrics.rejectedCount,
      color: "bg-rose-500",
    },
    {
      key: "REWORK_REQUIRED",
      label: "Rework Req.",
      count: metrics.reworkRequiredCount,
      color: "bg-amber-500",
    },
    {
      key: "COMPLETED",
      label: "Completed",
      count: metrics.completedCount,
      color: "bg-teal-500",
    },
  ];

  const urgentAttentionTasks = tasks.filter(
    (t: TaskItem) => t.priority === "URGENT" || t.status === "REWORK_REQUIRED",
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              AURORA AnnotOps Control Center
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time task pipeline performance, quality metrics, and SLA
            throughput diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Target SLA Compliance</p>
            <p className="text-sm font-bold text-emerald-400">98.5% On-Time</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Total Active Tasks
            </span>
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-400">
              {/* <CheckSquare className="w-4 h-4" /> */}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {metrics.totalTasks.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
              {/* <TrendingUp className="w-3.5 h-3.5" /> */}
              <span>+12.4% vs last week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Completion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              {/* <ShieldCheck className="w-4 h-4" /> */}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {metrics.completionRate}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Target: 95.0% Benchmark
            </p>
          </div>
        </div>

        {/* Card 3: Rejection Rate */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Rejection Rate
            </span>
            <div className="p-2 rounded-lg bg-rose-950 border border-rose-700/60 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-rose-400 tracking-tight">
              {metrics.rejectionRate}%
            </p>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">
              -0.8% MoM improvement
            </span>
          </div>
        </div>

        {/* Card 4: Average Review Time */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Avg. Review Time (MTTR)
            </span>
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-cyan-300 tracking-tight">
              {metrics.avgReviewTimeMinutes}m
            </p>
            <p className="text-xs text-slate-400 mt-1">
              MTTA Speed: {metrics.avgAnnotationTimeMinutes}m
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Workflow Pipeline (9 Current Lifecycle States) */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Task Workflow Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Current task distribution across the 9 lifecycle states
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-md">
            100% Accounted State Integrity
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
          {pipelineStates.map((st) => (
            <div
              key={st.key}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between min-w-0"
            >
              <div className="flex items-center gap-1.5 mb-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${st.color}`} />
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  {st.label}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-100">
                {st.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section 2: Annotator Productivity */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Team Productivity Throughput
              </h3>
              <p className="text-xs text-slate-400">
                Daily annotated vs. reviewed volumes
              </p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="annotated"
                  fill="#06B6D4"
                  radius={[4, 4, 0, 0]}
                  name="Annotated"
                />
                <Bar
                  dataKey="reviewed"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  name="Reviewed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Quality Control Trends */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Quality Pass Rate vs. Rejections
              </h3>
              <p className="text-xs text-slate-400">
                First-pass accuracy progression (%)
              </p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="passRate"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  name="Pass Rate %"
                />
                <Line
                  type="monotone"
                  dataKey="rejectionRate"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  name="Rejection %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 4: Tasks Requiring Attention */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {/* <AlertTriangle className="w-4 h-4 text-amber-400" /> */}
              Tasks Requiring Immediate Attention ({urgentAttentionTasks.length}
              )
            </h3>
            <p className="text-xs text-slate-400">
              Urgent priority items and active rework queues
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Task ID</th>
                <th className="p-3">Title & Dataset</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">SLA Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {urgentAttentionTasks.map((t: TaskItem) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3 font-mono font-semibold text-cyan-400">
                    {t.id}
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-200">{t.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {t.datasetName}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="p-3 text-slate-300">
                    {t.assigneeName || "Unassigned"}
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {new Date(t.slaDeadline).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
