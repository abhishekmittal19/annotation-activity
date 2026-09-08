'use client';

import React from 'react';
import { TaskStatus } from '@/types/task';
import { Check, Circle, AlertTriangle } from 'lucide-react';

interface WorkflowTimelineProps {
  currentStatus: TaskStatus;
  className?: string;
}

export function WorkflowTimeline({ currentStatus, className = '' }: WorkflowTimelineProps) {
  const steps = [
    { key: 'PENDING', label: 'Created' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'APPROVED_OR_REJECTED', label: 'QA Check' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStepState = (stepKey: string) => {
    if (currentStatus === 'REJECTED' || currentStatus === 'REWORK_REQUIRED') {
      if (stepKey === 'APPROVED_OR_REJECTED') return 'REJECTED';
    }

    const orderMap: Record<string, number> = {
      PENDING: 1,
      ASSIGNED: 2,
      IN_PROGRESS: 3,
      SUBMITTED: 4,
      UNDER_REVIEW: 5,
      APPROVED_OR_REJECTED: 6,
      APPROVED: 6,
      COMPLETED: 7,
    };

    const currentOrder = orderMap[currentStatus] || 1;
    const stepOrder = orderMap[stepKey] || 1;

    if (stepOrder < currentOrder) return 'COMPLETED';
    if (stepOrder === currentOrder) return 'ACTIVE';
    return 'UPCOMING';
  };

  return (
    <div className={`w-full py-3 px-4 bg-slate-900/60 border border-slate-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between relative overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const state = getStepState(step.key);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                    state === 'COMPLETED'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : state === 'ACTIVE'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/20'
                      : state === 'REJECTED'
                      ? 'bg-rose-950 border-rose-500 text-rose-300'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {state === 'COMPLETED' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : state === 'REJECTED' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      state === 'COMPLETED'
                        ? 'text-emerald-300'
                        : state === 'ACTIVE'
                        ? 'text-cyan-300 font-semibold'
                        : state === 'REJECTED'
                        ? 'text-rose-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {state === 'ACTIVE' && (
                    <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider">Current</span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={`h-0.5 flex-1 min-w-[20px] mx-2 rounded ${
                    state === 'COMPLETED'
                      ? 'bg-emerald-500/50'
                      : state === 'ACTIVE'
                      ? 'bg-cyan-500/50'
                      : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
