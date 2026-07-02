import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../store/tasksSlice';
import { TaskList } from '../components/TaskList';
import { TaskType, TaskStatus } from '../utils/normalize';

import { RootState } from '../store';

// Helper to render TaskList with a pre-configured store
function renderWithRedux(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    preloadedState,
  });

  return {
    ...render(
      <Provider store={store}>
        <TaskList />
      </Provider>
    ),
    store,
  };
}

describe('TaskList Component - React Testing Library', () => {
  const mockTasksState = {
    tasks: {
      ids: ['t1', 't2'],
      entities: {
        t1: {
          id: 't1',
          title: 'Apple Sorting Task',
          type: TaskType.Image,
          status: TaskStatus.Todo,
          annotationCount: 3,
          updatedAt: 1000,
          assignee: null,
          meta: {},
        },
        t2: {
          id: 't2',
          title: 'Banana Labeling Task',
          type: TaskType.Audio,
          status: TaskStatus.InProgress,
          annotationCount: 7,
          updatedAt: 2000,
          assignee: { id: 'u1', name: 'Asha' },
          meta: {},
        },
      },
      page: 1,
      pageSize: 10,
      total: 2,
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
    },
  };

  test('should render task rows and columns correctly', () => {
    renderWithRedux(mockTasksState);

    // Verify task titles are rendered
    expect(screen.getByText('Apple Sorting Task')).toBeInTheDocument();
    expect(screen.getByText('Banana Labeling Task')).toBeInTheDocument();

    // Verify assignee names or placeholders are rendered
    expect(screen.getByText('Asha')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();

    // Verify annotations count
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('should update visible tasks when typing in the search box', () => {
    const { store } = renderWithRedux(mockTasksState);

    // Verify both tasks are initially visible
    expect(screen.getByText('Apple Sorting Task')).toBeInTheDocument();
    expect(screen.getByText('Banana Labeling Task')).toBeInTheDocument();

    // Locate the search input
    const searchInput = screen.getByPlaceholderText(/Search by task title/i);

    // Type "Apple" to trigger state update
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    // Verify search query in store has updated
    expect(store.getState().tasks.searchQuery).toBe('Apple');

    // Apple Sorting should remain, Banana Labeling should disappear
    expect(screen.getByText('Apple Sorting Task')).toBeInTheDocument();
    expect(screen.queryByText('Banana Labeling Task')).not.toBeInTheDocument();
  });

  test('should update status and type filters when selecting option dropdowns', () => {
    const { store } = renderWithRedux(mockTasksState);

    const selects = screen.getAllByRole('combobox');
    
    // Type filter is the first dropdown, Status filter is the second dropdown
    const typeDropdown = selects[0];
    const statusDropdown = selects[1];

    // Change type filter to "audio"
    fireEvent.change(typeDropdown, { target: { value: TaskType.Audio } });
    expect(store.getState().tasks.filterType).toBe(TaskType.Audio);

    // Change status filter to "in_progress"
    fireEvent.change(statusDropdown, { target: { value: TaskStatus.InProgress } });
    expect(store.getState().tasks.filterStatus).toBe(TaskStatus.InProgress);
  });
});
