'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TaskItem, ActivityEvent } from '@/types/task';
import { tasksApi } from '@/lib/api/tasks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WorkflowTimeline } from '@/components/shared/WorkflowTimeline';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Tag,
  PenTool,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';

export function TaskDetailsInspector({ id }: { id: string }) {
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.getTaskById(id),
  });

  if (isLoading || !task) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading Task Details Inspector...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {task.id}
              </span>
              <h1 className="text-xl font-bold text-slate-100">{task.title}</h1>
              <StatusBadge status={task.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dataset: {task.datasetName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/annotation"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>Open in Annotation Workspace</span>
          </Link>
        </div>
      </div>

      {/* Workflow Timeline Component */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Workflow Lifecycle Progress
        </h2>
        <WorkflowTimeline currentStatus={task.status} />
      </div>

      {/* Metadata & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Task Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            Task Parameters
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Task Type:</span>
              <span className="font-semibold text-slate-200">{task.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Priority Level:</span>
              <span className="font-bold text-rose-400">{task.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Revision:</span>
              <span className="font-mono text-cyan-300 font-bold">
                Revision v{task.revisionVersion}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Annotations:</span>
              <span className="font-bold text-emerald-400">
                {task.annotations?.length ?? task.annotationCount ?? 0}{" "}
                annotations
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Assignment & Personnel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-indigo-400" />
            Assigned Personnel
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Annotator:</span>
              <span className="font-semibold text-slate-200">
                {task.assigneeName || "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reviewer:</span>
              <span className="font-semibold text-purple-300">
                {task.reviewerName || "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SLA Deadline:</span>
              <span className="font-mono text-slate-300">
                {new Date(task.slaDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Key Dates Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Timestamp Audit
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span className="text-slate-300">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
            {task.submittedAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted:</span>
                <span className="text-blue-300">
                  {new Date(task.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
            {task.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Reviewed:</span>
                <span className="text-purple-300">
                  {new Date(task.reviewedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity History Audit Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          Immutable Activity History Stream ({task.activityHistory?.length ??
            0}{" "}
          Events)
        </h2>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {(task.activityHistory ?? []).map((act: ActivityEvent) => (
            <div key={act.id} className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400" />
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {act.actor.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 uppercase">
                      {act.actor.role}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {act.action}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-400">{act.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
