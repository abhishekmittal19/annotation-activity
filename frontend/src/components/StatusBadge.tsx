import React from 'react';
import { TaskStatus } from '@/utils/normalize';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    [TaskStatus.Todo]: 'bg-slate-800 text-slate-300 border-slate-700',
    [TaskStatus.InProgress]: 'bg-amber-950/40 text-amber-400 border-amber-800/50',
    [TaskStatus.Done]: 'bg-emerald-950/45 text-emerald-400 border-emerald-800/50',
    [TaskStatus.QA]: 'bg-indigo-950/40 text-indigo-400 border-indigo-800/50',
    [TaskStatus.Blocked]: 'bg-rose-950/40 text-rose-400 border-rose-800/50',
  };

  const label = {
    [TaskStatus.Todo]: 'Todo',
    [TaskStatus.InProgress]: 'In Progress',
    [TaskStatus.Done]: 'Completed',
    [TaskStatus.QA]: 'In QA',
    [TaskStatus.Blocked]: 'Blocked',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {label[status]}
    </span>
  );
}
