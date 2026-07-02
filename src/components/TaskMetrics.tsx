import React from 'react';
import { useSelector } from 'react-redux';
import { selectTaskMetrics } from '@/store/tasksSlice';
import { TaskStatus, TaskType } from '@/utils/normalize';
import { CheckCircle, PlayCircle, HelpCircle, FileText, BarChart2 } from 'lucide-react';

export function TaskMetrics() {
  const metrics = useSelector(selectTaskMetrics);
  const { statusCounts, typeCounts, totalCount } = metrics;

  const statusConfig = [
    { key: TaskStatus.Todo, label: 'Todo', color: 'bg-slate-500', text: 'text-slate-400', count: statusCounts[TaskStatus.Todo] },
    { key: TaskStatus.InProgress, label: 'In Progress', color: 'bg-amber-500', text: 'text-amber-400', count: statusCounts[TaskStatus.InProgress] },
    { key: TaskStatus.Done, label: 'Completed', color: 'bg-emerald-500', text: 'text-emerald-400', count: statusCounts[TaskStatus.Done] },
    { key: TaskStatus.QA, label: 'QA', color: 'bg-indigo-500', text: 'text-indigo-400', count: statusCounts[TaskStatus.QA] },
    { key: TaskStatus.Blocked, label: 'Blocked', color: 'bg-rose-500', text: 'text-rose-400', count: statusCounts[TaskStatus.Blocked] },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          Metrics Overview
        </h2>
        <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded-full font-medium text-slate-300">
          Total Cached: <span className="font-bold text-indigo-400">{totalCount}</span>
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="text-slate-500 text-sm text-center py-6">
          No metrics available yet. Load tasks to generate analytics.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status distribution bar chart */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Task Status Distribution</span>
              <span>100% of local buffer</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              {statusConfig.map((status) => {
                const percentage = totalCount > 0 ? (status.count / totalCount) * 100 : 0;
                if (percentage === 0) return null;
                return (
                  <div
                    key={status.key}
                    style={{ width: `${percentage}%` }}
                    className={`${status.color} transition-all duration-500 ease-out`}
                    title={`${status.label}: ${status.count} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Cards for each status */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statusConfig.map((status) => {
              const pct = totalCount > 0 ? ((status.count / totalCount) * 100).toFixed(0) : '0';
              return (
                <div key={status.key} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-center transition-all hover:border-slate-700">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{status.label}</div>
                  <div className="text-xl font-extrabold text-slate-100">{status.count}</div>
                  <div className={`text-[10px] font-bold ${status.text}`}>{pct}%</div>
                </div>
              );
            })}
          </div>

          {/* Types breakdown */}
          <div className="border-t border-slate-800 pt-4">
            <div className="text-xs text-slate-400 mb-3 font-medium">Task Types distribution</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-sky-950/60 border border-sky-800/30 text-sky-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Images</div>
                  <div className="text-sm font-bold text-slate-200">{typeCounts[TaskType.Image]}</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-950/60 border border-amber-800/30 text-amber-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Audio</div>
                  <div className="text-sm font-bold text-slate-200">{typeCounts[TaskType.Audio]}</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-950/60 border border-teal-800/30 text-teal-400">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Text</div>
                  <div className="text-sm font-bold text-slate-200">{typeCounts[TaskType.Text]}</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-950/60 border border-slate-800/60 text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Unknown</div>
                  <div className="text-sm font-bold text-slate-200">{typeCounts[TaskType.Unknown]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
