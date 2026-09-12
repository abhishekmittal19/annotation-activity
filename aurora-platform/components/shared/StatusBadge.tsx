'use client';

import React from 'react';
import { TaskStatus } from '@/types/task';
import {
  Hourglass,
  UserCheck,
  Zap,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          icon: Hourglass,
          bg: 'bg-slate-800/80',
          text: 'text-slate-300',
          border: 'border-slate-600 border-dashed',
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          icon: UserCheck,
          bg: 'bg-indigo-950/60',
          text: 'text-indigo-300',
          border: 'border-indigo-700/60 border-dotted',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          icon: Zap,
          bg: 'bg-cyan-950/60',
          text: 'text-cyan-300',
          border: 'border-cyan-500/80 border-solid animate-pulse',
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          icon: Send,
          bg: 'bg-blue-950/60',
          text: 'text-blue-300',
          border: 'border-blue-500/80 border-solid',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          icon: Search,
          bg: 'bg-purple-950/60',
          text: 'text-purple-300',
          border: 'border-purple-500/80 border-solid',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: CheckCircle2,
          bg: 'bg-emerald-950/60',
          text: 'text-emerald-300',
          border: 'border-emerald-500/80 border-solid',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: XCircle,
          bg: 'bg-rose-950/60',
          text: 'text-rose-300',
          border: 'border-rose-500/80 border-solid',
        };
      case 'REWORK_REQUIRED':
        return {
          label: 'Rework Required',
          icon: RotateCcw,
          bg: 'bg-amber-950/60',
          text: 'text-amber-300',
          border: 'border-amber-500/80 border-solid',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          icon: ShieldCheck,
          bg: 'bg-teal-950/60',
          text: 'text-teal-300',
          border: 'border-teal-500/80 border-double',
        };
      default:
        return {
          label: status,
          icon: Hourglass,
          bg: 'bg-slate-800',
          text: 'text-slate-300',
          border: 'border-slate-600',
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
      title={`Task Status: ${config.label}`}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
}
