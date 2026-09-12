import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  setPage,
  setPageSize,
  setFilterType,
  setFilterStatus,
  setSearchQuery,
  setSort,
  setSelectedTaskId,
  fetchTasks,
  selectFilterType,
  selectFilterStatus,
  selectSearchQuery,
  selectSortBy,
  selectSortOrder,
  selectCurrentPage,
  selectPageSize,
  selectSelectedTaskId,
  selectIsLoading,
  selectIsStale,
  selectError,
  selectPaginatedTasks,
} from '@/store/tasksSlice';
import { Task, TaskType, TaskStatus } from '@/utils/normalize';
import { StatusBadge } from './StatusBadge';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Volume2, 
  FileText, 
  HelpCircle, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export function TaskList() {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors from Redux store
  const filterType = useSelector(selectFilterType);
  const filterStatus = useSelector(selectFilterStatus);
  const searchQuery = useSelector(selectSearchQuery);
  const sortBy = useSelector(selectSortBy);
  const sortOrder = useSelector(selectSortOrder);
  const page = useSelector(selectCurrentPage);
  const pageSize = useSelector(selectPageSize);
  const selectedTaskId = useSelector(selectSelectedTaskId);
  const isLoading = useSelector(selectIsLoading);
  const isStale = useSelector(selectIsStale);
  const error = useSelector(selectError);

  // Get paginated list and filtered totals
  const { items: tasks, totalFiltered } = useSelector(selectPaginatedTasks);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Trigger manual refresh/revalidation
  const handleRefresh = () => {
    dispatch(fetchTasks({ page, pageSize }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterType(e.target.value as TaskType | 'all'));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterStatus(e.target.value as TaskStatus | 'all'));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setPageSize(Number(e.target.value)));
  };

  const handleSort = (column: 'updatedAt' | 'annotationCount' | 'title') => {
    if (sortBy === column) {
      // Toggle direction
      dispatch(setSort({ sortBy: column, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' }));
    } else {
      // Sort desc for numbers/dates by default, asc for text
      const defaultOrder = column === 'title' ? 'asc' : 'desc';
      dispatch(setSort({ sortBy: column, sortOrder: defaultOrder }));
    }
  };

  const renderSortIcon = (column: 'updatedAt' | 'annotationCount' | 'title') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : 
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const renderTypeIcon = (type: TaskType) => {
    switch (type) {
      case TaskType.Image:
        return <span title="Image Task"><ImageIcon className="w-4 h-4 text-sky-400" /></span>;
      case TaskType.Audio:
        return <span title="Audio Task"><Volume2 className="w-4 h-4 text-amber-400" /></span>;
      case TaskType.Text:
        return <span title="Text Task"><FileText className="w-4 h-4 text-teal-400" /></span>;
      default:
        return <span title="Unknown Task"><HelpCircle className="w-4 h-4 text-slate-400" /></span>;
    }
  };

  // Helper to format timestamps nicely
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Caching/Stale revalidation banner */}
      {isStale && (
        <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs text-amber-400 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>Showing cached dashboard data. Background revalidation is active...</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 px-2 py-0.5 rounded transition-all text-amber-300 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Sync Now
          </button>
        </div>
      )}

      {/* Toolbar / Filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by task title, assignee, or ID..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={handleTypeChange}
          className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="all">All Types</option>
          <option value={TaskType.Image}>Images</option>
          <option value={TaskType.Audio}>Audios</option>
          <option value={TaskType.Text}>Texts</option>
          <option value={TaskType.Unknown}>Unknown / Video</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={handleStatusChange}
          className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value={TaskStatus.Todo}>Todo</option>
          <option value={TaskStatus.InProgress}>In Progress</option>
          <option value={TaskStatus.Done}>Completed</option>
          <option value={TaskStatus.QA}>In QA</option>
          <option value={TaskStatus.Blocked}>Blocked</option>
        </select>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto relative min-h-[300px]">
        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">Failed to load tasks</h3>
            <p className="text-sm text-slate-400 max-w-md mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && !isStale && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-300 font-medium">Loading activity data...</span>
            </div>
          </div>
        )}

        {/* Table structure */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-12 text-center">Type</th>
              <th className="py-3 px-4 cursor-pointer group hover:bg-slate-900/60" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-2">
                  <span>Task Name</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer group hover:bg-slate-900/60 text-right" onClick={() => handleSort('annotationCount')}>
                <div className="flex items-center justify-end gap-2">
                  <span>Annotations</span>
                  {renderSortIcon('annotationCount')}
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer group hover:bg-slate-900/60" onClick={() => handleSort('updatedAt')}>
                <div className="flex items-center gap-2">
                  <span>Last Updated</span>
                  {renderSortIcon('updatedAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
            {tasks.map((task: Task) => {
              const isSelected = selectedTaskId === task.id;
              return (
                <tr
                  key={task.id}
                  onClick={() => dispatch(setSelectedTaskId(task.id))}
                  className={`cursor-pointer transition-colors duration-150 group
                             ${isSelected ? 'bg-indigo-650/20 text-slate-100 hover:bg-indigo-650/25 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'}`}
                >
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">{renderTypeIcon(task.type)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">{task.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{task.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-3 px-4">
                    {task.assignee ? (
                      <span className="font-medium text-slate-200">{task.assignee.name}</span>
                    ) : (
                      <span className="text-slate-500 italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                    {task.annotationCount}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-medium">
                    {formatTime(task.updatedAt)}
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {tasks.length === 0 && !isLoading && !error && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="text-slate-500 flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-10 h-10 text-slate-600" />
                    <span className="text-base font-semibold">No tasks match your filter</span>
                    <p className="text-xs text-slate-500 max-w-sm">Try relaxing your search terms or choosing alternative filters.</p>
                    <button
                      onClick={() => {
                        dispatch(setSearchQuery(''));
                        dispatch(setFilterType('all'));
                        dispatch(setFilterStatus('all'));
                      }}
                      className="mt-3 px-4 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-4">
          {/* Page Size select */}
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>

          <div>
            Showing <span className="font-bold text-slate-200">{Math.min(totalFiltered, (page - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold text-slate-200">{Math.min(totalFiltered, page * pageSize)}</span> of{' '}
            <span className="font-bold text-indigo-400">{totalFiltered}</span> items
          </div>
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setPage(page - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-medium">
            Page <span className="text-slate-200 font-bold">{page}</span> of{' '}
            <span className="text-slate-200 font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => dispatch(setPage(page + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
