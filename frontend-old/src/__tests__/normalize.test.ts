import { normalizeTask, TaskType, TaskStatus } from '../utils/normalize';

describe('API Normalizer - normalizeTask', () => {
  test('should normalize basic properties and default missing ones', () => {
    const raw = {
      id: 't1',
      title: 'Task 1',
      type: 'image',
      status: 'todo',
      assignee: null,
      annotationCount: 5,
      updatedAt: 1719600000000,
    };

    const task = normalizeTask(raw);

    expect(task.id).toBe('t1');
    expect(task.title).toBe('Task 1');
    expect(task.type).toBe(TaskType.Image);
    expect(task.status).toBe(TaskStatus.Todo);
    expect(task.assignee).toBeNull();
    expect(task.annotationCount).toBe(5);
    expect(task.updatedAt).toBe(1719600000000);
    expect(task.meta).toEqual({});
  });

  test('should handle inconsistent status casing and spelling', () => {
    expect(normalizeTask({ id: '1', status: 'InProgress' }).status).toBe(TaskStatus.InProgress);
    expect(normalizeTask({ id: '2', status: 'in_progress' }).status).toBe(TaskStatus.InProgress);
    expect(normalizeTask({ id: '3', status: 'done' }).status).toBe(TaskStatus.Done);
    expect(normalizeTask({ id: '4', status: 'QA' }).status).toBe(TaskStatus.QA);
    expect(normalizeTask({ id: '5', status: 'BLOCKED' }).status).toBe(TaskStatus.Blocked);
    expect(normalizeTask({ id: '6', status: 'garbage_status' }).status).toBe(TaskStatus.Todo); // fallback
  });

  test('should coerce annotation counts from strings and float numbers', () => {
    expect(normalizeTask({ id: '1', annotationCount: '15' }).annotationCount).toBe(15);
    expect(normalizeTask({ id: '2', annotationCount: 'invalid-string' }).annotationCount).toBe(0);
    expect(normalizeTask({ id: '3', annotationCount: 4.8 }).annotationCount).toBe(4);
    expect(normalizeTask({ id: '4', annotationCount: null }).annotationCount).toBe(0);
  });

  test('should parse mixed timestamp formats', () => {
    // 1. ISO String
    const isoString = '2024-06-28T18:40:00.000Z';
    const parsedIso = Date.parse(isoString);
    expect(normalizeTask({ id: '1', updatedAt: isoString }).updatedAt).toBe(parsedIso);

    // 2. Epoch in seconds (needs conversion to ms)
    expect(normalizeTask({ id: '2', updatedAt: 1719600000 }).updatedAt).toBe(1719600000000);

    // 3. Epoch in milliseconds
    expect(normalizeTask({ id: '3', updatedAt: 1719600000000 }).updatedAt).toBe(1719600000000);

    // 4. Invalid timestamp type (should fallback to Date.now())
    const start = Date.now();
    const task = normalizeTask({ id: '4', updatedAt: {} });
    expect(task.updatedAt).toBeGreaterThanOrEqual(start);
  });

  test('should model unknown and video task types as TaskType.Unknown with rawType preserved', () => {
    const task = normalizeTask({ id: '1', type: 'video' });
    expect(task.type).toBe(TaskType.Unknown);
    if (task.type === TaskType.Unknown) {
      expect(task.rawType).toBe('video');
    }

    const task2 = normalizeTask({ id: '2', type: 'xyz_type' });
    expect(task2.type).toBe(TaskType.Unknown);
    if (task2.type === TaskType.Unknown) {
      expect(task2.rawType).toBe('xyz_type');
    }
  });

  test('should normalize assignee objects and recover from partial attributes', () => {
    const task1 = normalizeTask({ id: '1', assignee: { id: 'u1', name: 'Asha' } });
    expect(task1.assignee).toEqual({ id: 'u1', name: 'Asha' });

    const task2 = normalizeTask({ id: '2', assignee: { id: 'u2' } }); // partial id
    expect(task2.assignee).toEqual({ id: 'u2', name: 'Unknown User' });

    const task3 = normalizeTask({ id: '3', assignee: 'just-a-string-instead-of-object' });
    expect(task3.assignee).toBeNull();
  });
});
