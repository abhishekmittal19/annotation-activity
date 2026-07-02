import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
  selectSelectedTask, 
  optimisticAssign, 
  rollbackAssign 
} from '@/store/tasksSlice';
import { TaskSummaryStream } from './TaskSummaryStream';
import { StatusBadge } from './StatusBadge';
import { 
  User as UserIcon, 
  Calendar, 
  Layers, 
  Database, 
  UserCheck, 
  AlertCircle,
  FileCheck,
  CheckCircle
} from 'lucide-react';

export function TaskDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const task = useSelector(selectSelectedTask);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Current logged in user (simulation)
  const currentUser = { id: 'u2', name: 'Ben' };

  if (!task) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <Layers className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">No Task Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select an annotation task from the activity feed list to inspect details, metadata, and stream summaries.
        </p>
      </div>
    );
  }

  // Handle optimistic assignment
  const handleAssignToMe = async () => {
    if (assigning) return;
    setAssigning(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const originalAssignee = task.assignee;

    // 1. Dispatch optimistic assignment action
    dispatch(optimisticAssign({ id: task.id, assignee: currentUser }));

    // 2. Simulate API request with random success/failure
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.25; // 75% success, 25% failure
          if (success) {
            resolve();
          } else {
            reject(new Error('Network timeout: Failed to update task assignment on server.'));
          }
        }, 1200);
      });
      
      setSuccessMsg('Successfully assigned task to yourself!');
      // clear success msg after 3s
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      // 3. Rollback on failure
      dispatch(rollbackAssign({ id: task.id, originalAssignee }));
      const msg = err instanceof Error ? err.message : 'Failed to update assignment.';
      setErrorMsg(msg);
    } finally {
      setAssigning(false);
    }
  };

  const isAssignedToMe = task.assignee?.id === currentUser.id;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full overflow-auto">
      {/* Title & Core Header */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Task Details</div>
            <h2 className="text-xl font-black text-slate-100 mt-1">{task.title}</h2>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {task.id}</div>
          </div>
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Dynamic messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Optimistic Update Failed:</span> {errorMsg} (State has been rolled back)
          </div>
        </div>
      )}

      {/* Grid Properties */}
      <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-lg text-xs mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-500 font-medium">Task Type</div>
              <div className="font-semibold text-slate-200 capitalize">
                {task.type === 'unknown' ? 'video (unknown)' : task.type}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-500 font-medium">Assignee</div>
              <div className="font-semibold text-slate-200">
                {task.assignee ? task.assignee.name : <span className="text-slate-500 italic">Unassigned</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-500 font-medium">Annotations Count</div>
              <div className="font-semibold text-slate-200 font-mono">{task.annotationCount} annotations</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-slate-500 font-medium">Last Event Timestamp</div>
              <div className="font-semibold text-slate-200">
                {new Date(task.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign to me Button */}
      <div className="mb-4">
        <button
          onClick={handleAssignToMe}
          disabled={assigning || isAssignedToMe}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 border select-none
            ${isAssignedToMe 
              ? 'bg-slate-950 border-emerald-900/40 text-emerald-500 cursor-default' 
              : assigning
                ? 'bg-indigo-900/30 border-indigo-800/40 text-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-slate-100 active:scale-[0.98]'}`}
        >
          {assigning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Assigning on server...</span>
            </>
          ) : isAssignedToMe ? (
            <>
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Assigned to You</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Assign to Me</span>
            </>
          )}
        </button>
      </div>

      {/* Metadata Panel */}
      {Object.keys(task.meta).length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" /> Custom Metadata
          </h3>
          <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-lg flex flex-wrap gap-2">
            {Object.entries(task.meta).map(([key, val]) => (
              <div key={key} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs flex items-center gap-2">
                <span className="text-slate-500 font-mono">{key}:</span>
                <span className="font-semibold text-slate-200 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incremental SSE Summary stream */}
      <div className="mt-auto">
        <TaskSummaryStream taskId={task.id} />
      </div>
    </div>
  );
}
