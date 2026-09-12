import { createSlice, createAsyncThunk, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Task, TaskType, TaskStatus, User, normalizeTask, normalizeTasksList } from '@/utils/normalize';
import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'AnnotationActivityConsole',
  storeName: 'tasks_cache',
});

const TASKS_CACHE_KEY = 'cached_tasks_list';

export const tasksAdapter = createEntityAdapter<Task>();

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ page, pageSize }: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();
      // Normalize items before returning to store
      const normalizedItems = normalizeTasksList(data.items);
      return {
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        items: normalizedItems,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch tasks');
    }
  }
);

export const fetchSingleTask = createAsyncThunk(
  'tasks/fetchSingleTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tasks/${id}`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();
      const normalized = normalizeTask(data);
      return normalized;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : `Failed to fetch task ${id}`);
    }
  }
);

// Thunk to load cached tasks from IndexedDB on startup
export const loadCachedTasks = createAsyncThunk(
  'tasks/loadCache',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await localforage.getItem<Task[]>(TASKS_CACHE_KEY);
      return cached || [];
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load tasks from cache');
    }
  }
);

interface TasksState {
  page: number;
  pageSize: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  
  // Filters and sorting
  filterType: TaskType | 'all';
  filterStatus: TaskStatus | 'all';
  searchQuery: string;
  sortBy: 'updatedAt' | 'annotationCount' | 'title';
  sortOrder: 'asc' | 'desc';
  
  selectedTaskId: string | null;
  singleTaskLoading: Record<string, boolean>;
}

const initialState = tasksAdapter.getInitialState<TasksState>({
  page: 1,
  pageSize: 20,
  total: 0,
  isLoading: false,
  error: null,
  isStale: false,
  
  filterType: 'all',
  filterStatus: 'all',
  searchQuery: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  
  selectedTaskId: null,
  singleTaskLoading: {},
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1; // Reset page to 1
    },
    setFilterType(state, action: PayloadAction<TaskType | 'all'>) {
      state.filterType = action.payload;
      state.page = 1;
    },
    setFilterStatus(state, action: PayloadAction<TaskStatus | 'all'>) {
      state.filterStatus = action.payload;
      state.page = 1;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: 'updatedAt' | 'annotationCount' | 'title'; sortOrder: 'asc' | 'desc' }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setSelectedTaskId(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    // Manual task update (WebSocket integration)
    wsTaskUpdated(state, action: PayloadAction<{ id: string; status: TaskStatus; updatedAt: number }>) {
      const { id, status, updatedAt } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        // Use adapter to update task status and updatedAt
        tasksAdapter.updateOne(state, {
          id,
          changes: { status, updatedAt },
        });
      }
    },
    wsTaskAssigned(state, action: PayloadAction<{ id: string; assignee: User | null }>) {
      const { id, assignee } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        tasksAdapter.updateOne(state, {
          id,
          changes: { assignee },
        });
      }
    },
    wsAnnotationCreated(state, action: PayloadAction<{ taskId: string }>) {
      const { taskId } = action.payload;
      const existing = state.entities[taskId];
      if (existing) {
        tasksAdapter.updateOne(state, {
          id: taskId,
          changes: { annotationCount: existing.annotationCount + 1 },
        });
      }
    },
    // Optimistic assignment (Bonus)
    optimisticAssign(state, action: PayloadAction<{ id: string; assignee: User | null }>) {
      const { id, assignee } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        tasksAdapter.updateOne(state, {
          id,
          changes: { assignee },
        });
      }
    },
    // Rollback assignment if API failed
    rollbackAssign(state, action: PayloadAction<{ id: string; originalAssignee: User | null }>) {
      const { id, originalAssignee } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        tasksAdapter.updateOne(state, {
          id,
          changes: { assignee: originalAssignee },
        });
      }
    },
  },
  extraReducers: (builder) => {
    // 1. Load cache from IndexedDB
    builder.addCase(loadCachedTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadCachedTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.length > 0) {
        tasksAdapter.setAll(state, action.payload);
        state.total = action.payload.length;
        state.isStale = true; // Mark as stale until we revalidate from server
      }
    });
    builder.addCase(loadCachedTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // 2. Fetch Tasks list
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isStale = false; // Server response arrived, no longer stale
      
      // Upsert tasks into the adapter so we keep previously visited tasks too
      tasksAdapter.upsertMany(state, action.payload.items);
      state.total = Math.max(state.ids.length, action.payload.total);

      // Async save current adapter tasks to IndexedDB without blocking main thread
      const allTasks = Object.values(state.entities) as Task[];
      localforage.setItem(TASKS_CACHE_KEY, allTasks).catch((err) => {
        console.error('Failed to write tasks to IndexedDB:', err);
      });
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // 3. Fetch single task (triggered when WebSocket event refers to unloaded task)
    builder.addCase(fetchSingleTask.pending, (state, action) => {
      state.singleTaskLoading[action.meta.arg] = true;
    });
    builder.addCase(fetchSingleTask.fulfilled, (state, action) => {
      delete state.singleTaskLoading[action.payload.id];
      tasksAdapter.upsertOne(state, action.payload);
      
      // Also update IndexedDB
      const allTasks = Object.values(state.entities) as Task[];
      localforage.setItem(TASKS_CACHE_KEY, allTasks).catch((err) => {
        console.error('Failed to write tasks to IndexedDB:', err);
      });
    });
    builder.addCase(fetchSingleTask.rejected, (state, action) => {
      delete state.singleTaskLoading[action.meta.arg];
      console.error(`Failed to fetch task ${action.meta.arg}:`, action.payload);
    });
  },
});

export const {
  setPage,
  setPageSize,
  setFilterType,
  setFilterStatus,
  setSearchQuery,
  setSort,
  setSelectedTaskId,
  wsTaskUpdated,
  wsTaskAssigned,
  wsAnnotationCreated,
  optimisticAssign,
  rollbackAssign,
} = tasksSlice.actions;

export default tasksSlice.reducer;

// RootState type helper
type RootState = {
  tasks: ReturnType<typeof tasksSlice.reducer>;
};

// Selectors
export const {
  selectAll: selectAllTasksFromAdapter,
  selectById: selectTaskById,
} = tasksAdapter.getSelectors<RootState>((state) => state.tasks);

// Filters and sorts selector
export const selectFilterType = (state: RootState) => state.tasks.filterType;
export const selectFilterStatus = (state: RootState) => state.tasks.filterStatus;
export const selectSearchQuery = (state: RootState) => state.tasks.searchQuery;
export const selectSortBy = (state: RootState) => state.tasks.sortBy;
export const selectSortOrder = (state: RootState) => state.tasks.sortOrder;
export const selectCurrentPage = (state: RootState) => state.tasks.page;
export const selectPageSize = (state: RootState) => state.tasks.pageSize;
export const selectSelectedTaskId = (state: RootState) => state.tasks.selectedTaskId;
export const selectIsLoading = (state: RootState) => state.tasks.isLoading;
export const selectIsStale = (state: RootState) => state.tasks.isStale;
export const selectError = (state: RootState) => state.tasks.error;

// Memoized selector for filtering and sorting
export const selectFilteredSortedTasks = createSelector(
  [
    selectAllTasksFromAdapter,
    selectFilterType,
    selectFilterStatus,
    selectSearchQuery,
    selectSortBy,
    selectSortOrder,
  ],
  (tasks, filterType, filterStatus, searchQuery, sortBy, sortOrder) => {
    // 1. Filter
    let filtered = tasks;

    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.assignee && t.assignee.name.toLowerCase().includes(q))
      );
    }

    // 2. Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'updatedAt') {
        comparison = a.updatedAt - b.updatedAt;
      } else if (sortBy === 'annotationCount') {
        comparison = a.annotationCount - b.annotationCount;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
);

// Memoized selector for the paginated view of filtered/sorted tasks
export const selectPaginatedTasks = createSelector(
  [selectFilteredSortedTasks, selectCurrentPage, selectPageSize],
  (filteredTasks, page, pageSize) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: filteredTasks.slice(start, end),
      totalFiltered: filteredTasks.length,
    };
  }
);

// Memoized selector for selected task detail
export const selectSelectedTask = createSelector(
  [selectAllTasksFromAdapter, selectSelectedTaskId],
  (tasks, selectedId) => {
    if (!selectedId) return null;
    return tasks.find((t) => t.id === selectedId) || null;
  }
);

// Memoized selector for task metrics
export const selectTaskMetrics = createSelector(
  [selectAllTasksFromAdapter],
  (tasks) => {
    const counts = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
      [TaskStatus.QA]: 0,
      [TaskStatus.Blocked]: 0,
    };

    let total = 0;
    tasks.forEach((t) => {
      // Map unknown statuses to todo, but we normalized them already
      if (t.status in counts) {
        counts[t.status]++;
        total++;
      }
    });

    const typeCounts = {
      [TaskType.Image]: 0,
      [TaskType.Audio]: 0,
      [TaskType.Text]: 0,
      [TaskType.Unknown]: 0,
    };

    tasks.forEach((t) => {
      if (t.type in typeCounts) {
        typeCounts[t.type]++;
      }
    });

    return {
      statusCounts: counts,
      typeCounts: typeCounts,
      totalCount: total,
    };
  }
);
