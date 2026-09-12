import {
  tasksAdapter,
  selectFilteredSortedTasks,
  selectTaskMetrics,
} from '../store/tasksSlice';
import { Task, TaskType, TaskStatus } from '../utils/normalize';

// Helper to construct a minimal Task for testing
function mockTask(id: string, overrides?: Partial<Task>): Task {
  return {
    id,
    title: `Task ${id}`,
    type: TaskType.Image,
    status: TaskStatus.Todo,
    assignee: null,
    annotationCount: 1,
    updatedAt: 1000,
    meta: {},
    ...overrides,
  } as Task;
}

describe('Redux Selectors - Tasks Filtering and Sorting', () => {
  const tasksList = [
    mockTask('t1', { title: 'Apple Task', type: TaskType.Image, status: TaskStatus.Todo, annotationCount: 10, updatedAt: 5000 }),
    mockTask('t2', { title: 'Banana Task', type: TaskType.Audio, status: TaskStatus.InProgress, annotationCount: 2, updatedAt: 2000 }),
    mockTask('t3', { title: 'Cherry Task', type: TaskType.Text, status: TaskStatus.Done, annotationCount: 20, updatedAt: 9000 }),
    mockTask('t4', { title: 'Date Task', type: TaskType.Image, status: TaskStatus.QA, annotationCount: 5, updatedAt: 1000 }),
    mockTask('t5', { title: 'Fig Task', type: TaskType.Unknown, rawType: 'video', status: TaskStatus.Blocked, annotationCount: 0, updatedAt: 3000 }),
  ];

  // Set up store state
  const baseState = {
    tasks: tasksAdapter.setAll(
      tasksAdapter.getInitialState({
        page: 1,
        pageSize: 10,
        total: 5,
        isLoading: false,
        error: null,
        isStale: false,
        filterType: 'all' as const,
        filterStatus: 'all' as const,
        searchQuery: '',
        sortBy: 'updatedAt' as const,
        sortOrder: 'desc' as const,
        selectedTaskId: null,
        singleTaskLoading: {},
      }),
      tasksList
    ),
  };

  test('should return all tasks sorted by updatedAt descending by default', () => {
    const sorted = selectFilteredSortedTasks(baseState);
    expect(sorted).toHaveLength(5);
    expect(sorted[0].id).toBe('t3'); // 9000 ms
    expect(sorted[1].id).toBe('t1'); // 5000 ms
    expect(sorted[2].id).toBe('t5'); // 3000 ms
    expect(sorted[3].id).toBe('t2'); // 2000 ms
    expect(sorted[4].id).toBe('t4'); // 1000 ms
  });

  test('should filter tasks by type', () => {
    const state = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        filterType: TaskType.Image,
      },
    };

    const results = selectFilteredSortedTasks(state);
    expect(results).toHaveLength(2);
    expect(results.every((t) => t.type === TaskType.Image)).toBe(true);
    expect(results[0].id).toBe('t1'); // updatedAt 5000
    expect(results[1].id).toBe('t4'); // updatedAt 1000
  });

  test('should filter tasks by status', () => {
    const state = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        filterStatus: TaskStatus.InProgress,
      },
    };

    const results = selectFilteredSortedTasks(state);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe(TaskStatus.InProgress);
    expect(results[0].id).toBe('t2');
  });

  test('should search tasks by title (case-insensitive)', () => {
    const state = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        searchQuery: 'task', // all match
      },
    };
    expect(selectFilteredSortedTasks(state)).toHaveLength(5);

    const state2 = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        searchQuery: 'banana',
      },
    };
    const searchResult = selectFilteredSortedTasks(state2);
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].id).toBe('t2');
  });

  test('should sort tasks by title ascending', () => {
    const state = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      },
    };

    const sorted = selectFilteredSortedTasks(state);
    expect(sorted[0].title).toBe('Apple Task');
    expect(sorted[1].title).toBe('Banana Task');
    expect(sorted[2].title).toBe('Cherry Task');
    expect(sorted[3].title).toBe('Date Task');
    expect(sorted[4].title).toBe('Fig Task');
  });

  test('should calculate status and type statistics in selectTaskMetrics', () => {
    const metrics = selectTaskMetrics(baseState);
    expect(metrics.totalCount).toBe(5);
    expect(metrics.statusCounts[TaskStatus.Todo]).toBe(1);
    expect(metrics.statusCounts[TaskStatus.InProgress]).toBe(1);
    expect(metrics.statusCounts[TaskStatus.Done]).toBe(1);
    expect(metrics.statusCounts[TaskStatus.QA]).toBe(1);
    expect(metrics.statusCounts[TaskStatus.Blocked]).toBe(1);

    expect(metrics.typeCounts[TaskType.Image]).toBe(2);
    expect(metrics.typeCounts[TaskType.Audio]).toBe(1);
    expect(metrics.typeCounts[TaskType.Text]).toBe(1);
    expect(metrics.typeCounts[TaskType.Unknown]).toBe(1);
  });
});
