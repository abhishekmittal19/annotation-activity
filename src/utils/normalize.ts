export enum TaskType {
  Image = 'image',
  Audio = 'audio',
  Text = 'text',
  Unknown = 'unknown',
}

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
  QA = 'qa',
  Blocked = 'blocked',
}

export interface User {
  id: string;
  name: string;
}

export interface BaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: User | null;
  annotationCount: number;
  updatedAt: number; // Epoch timestamp in ms
  meta: Record<string, unknown>;
}

export interface ImageTask extends BaseTask {
  type: TaskType.Image;
}

export interface AudioTask extends BaseTask {
  type: TaskType.Audio;
}

export interface TextTask extends BaseTask {
  type: TaskType.Text;
}

export interface UnknownTask extends BaseTask {
  type: TaskType.Unknown;
  rawType: string;
}

export type Task = ImageTask | AudioTask | TextTask | UnknownTask;

// Structure for logging anomalies
export interface NormalizationAnomaly {
  taskId: string;
  field: string;
  rawValue: unknown;
  actionTaken: string;
}

const anomaliesLog: NormalizationAnomaly[] = [];

export function getNormalizationAnomalies(): NormalizationAnomaly[] {
  return [...anomaliesLog];
}

export function clearNormalizationAnomalies(): void {
  anomaliesLog.length = 0;
}

function logAnomaly(taskId: string, field: string, rawValue: unknown, actionTaken: string) {
  const anomaly = { taskId, field, rawValue, actionTaken };
  anomaliesLog.push(anomaly);
  console.warn(`[Normalizer Anomaly] Task ${taskId}: field "${field}" has raw value ${JSON.stringify(rawValue)}. Action: ${actionTaken}`);
}

export interface RawTask {
  id?: unknown;
  title?: unknown;
  type?: unknown;
  status?: unknown;
  assignee?: unknown;
  annotationCount?: unknown;
  updatedAt?: unknown;
  meta?: unknown;
}

export function normalizeTask(raw: RawTask): Task {
  // 1. Normalize ID
  let id = '';
  if (typeof raw.id === 'string' && raw.id.trim().length > 0) {
    id = raw.id;
  } else if (raw.id !== null && raw.id !== undefined) {
    id = String(raw.id);
    logAnomaly(id, 'id', raw.id, `Coerced ID to string "${id}"`);
  } else {
    id = `temp-${Math.random().toString(36).substr(2, 9)}`;
    logAnomaly(id, 'id', raw.id, `Generated random ID "${id}"`);
  }

  // 2. Normalize Title
  let title = 'Unnamed Task';
  if (typeof raw.title === 'string') {
    title = raw.title;
  } else if (raw.title !== null && raw.title !== undefined) {
    title = String(raw.title);
    logAnomaly(id, 'title', raw.title, `Coerced title to string "${title}"`);
  } else {
    logAnomaly(id, 'title', raw.title, `Defaulted title to "${title}"`);
  }

  // 3. Normalize Status
  let status = TaskStatus.Todo;
  const rawStatus = raw.status;
  if (typeof rawStatus === 'string') {
    const cleanStatus = rawStatus.trim().toLowerCase().replace(/[^a-z_]/g, '');
    if (cleanStatus === 'todo') {
      status = TaskStatus.Todo;
    } else if (cleanStatus === 'done') {
      status = TaskStatus.Done;
    } else if (cleanStatus === 'qa') {
      status = TaskStatus.QA;
    } else if (cleanStatus === 'blocked') {
      status = TaskStatus.Blocked;
    } else if (cleanStatus === 'inprogress' || cleanStatus === 'in_progress') {
      status = TaskStatus.InProgress;
    } else {
      status = TaskStatus.Todo;
      logAnomaly(id, 'status', rawStatus, `Unknown status string. Defaulted status to "${status}"`);
    }
    // Log anomaly if spelling or casing was mismatching but we successfully resolved it
    if (rawStatus !== status && !(status === TaskStatus.InProgress && (rawStatus === 'InProgress' || rawStatus === 'in_progress'))) {
      logAnomaly(id, 'status', rawStatus, `Normalized status to "${status}"`);
    }
  } else {
    logAnomaly(id, 'status', rawStatus, `Missing/invalid status type. Defaulted status to "${status}"`);
  }

  // 4. Normalize Assignee
  let assignee: User | null = null;
  if (raw.assignee && typeof raw.assignee === 'object') {
    const rawAssignee = raw.assignee as Record<string, unknown>;
    const aId = rawAssignee.id ? String(rawAssignee.id) : '';
    const aName = rawAssignee.name ? String(rawAssignee.name) : '';
    if (aId && aName) {
      assignee = { id: aId, name: aName };
    } else if (aId || aName) {
      assignee = { id: aId || 'unknown', name: aName || 'Unknown User' };
      logAnomaly(id, 'assignee', rawAssignee, `Partial assignee object. Coerced to id="${assignee.id}" name="${assignee.name}"`);
    } else {
      logAnomaly(id, 'assignee', rawAssignee, 'Empty assignee object. Set to null');
    }
  } else if (raw.assignee !== null && raw.assignee !== undefined) {
    logAnomaly(id, 'assignee', raw.assignee, `Unexpected assignee format. Set to null`);
  }

  // 5. Normalize Annotation Count
  let annotationCount = 0;
  const rawCount = raw.annotationCount;
  if (typeof rawCount === 'number') {
    annotationCount = Math.max(0, Math.floor(rawCount));
    if (rawCount !== annotationCount) {
      logAnomaly(id, 'annotationCount', rawCount, `Floored float value to ${annotationCount}`);
    }
  } else if (typeof rawCount === 'string') {
    const parsed = parseInt(rawCount, 10);
    if (!isNaN(parsed)) {
      annotationCount = Math.max(0, parsed);
      logAnomaly(id, 'annotationCount', rawCount, `Parsed count from string to ${annotationCount}`);
    } else {
      logAnomaly(id, 'annotationCount', rawCount, `Failed parsing string. Defaulted to ${annotationCount}`);
    }
  } else if (rawCount !== null && rawCount !== undefined) {
    logAnomaly(id, 'annotationCount', rawCount, `Invalid type. Defaulted to ${annotationCount}`);
  }

  // 6. Normalize Timestamp (updatedAt)
  let updatedAt = Date.now();
  const rawUpdated = raw.updatedAt;
  if (typeof rawUpdated === 'number') {
    // Check if epoch is in seconds or milliseconds
    if (rawUpdated < 50000000000) { // arbitrary threshold, e.g. year 1971 vs 1970
      updatedAt = rawUpdated * 1000;
      logAnomaly(id, 'updatedAt', rawUpdated, `Converted timestamp from seconds to milliseconds: ${updatedAt}`);
    } else {
      updatedAt = rawUpdated;
    }
  } else if (typeof rawUpdated === 'string') {
    const parsed = Date.parse(rawUpdated);
    if (!isNaN(parsed)) {
      updatedAt = parsed;
      // Log minor normalization from ISO string
      logAnomaly(id, 'updatedAt', rawUpdated, `Parsed ISO string to epoch ms: ${updatedAt}`);
    } else {
      logAnomaly(id, 'updatedAt', rawUpdated, `Failed to parse date string. Fallback to current time`);
    }
  } else if (rawUpdated !== null && rawUpdated !== undefined) {
    logAnomaly(id, 'updatedAt', rawUpdated, `Invalid timestamp type. Fallback to current time`);
  }

  // 7. Normalize Meta
  let meta: Record<string, unknown> = {};
  if (raw.meta && typeof raw.meta === 'object' && !Array.isArray(raw.meta)) {
    meta = { ...(raw.meta as Record<string, unknown>) };
  } else if (raw.meta !== null && raw.meta !== undefined) {
    logAnomaly(id, 'meta', raw.meta, `Invalid metadata type. Defaulted to empty object`);
  }

  // 8. Distinguish type and return clean Task model
  const rawType = raw.type;
  if (typeof rawType === 'string') {
    const cleanType = rawType.trim().toLowerCase();
    if (cleanType === 'image') {
      return {
        id,
        title,
        type: TaskType.Image,
        status,
        assignee,
        annotationCount,
        updatedAt,
        meta,
      };
    } else if (cleanType === 'audio') {
      return {
        id,
        title,
        type: TaskType.Audio,
        status,
        assignee,
        annotationCount,
        updatedAt,
        meta,
      };
    } else if (cleanType === 'text') {
      return {
        id,
        title,
        type: TaskType.Text,
        status,
        assignee,
        annotationCount,
        updatedAt,
        meta,
      };
    } else {
      return {
        id,
        title,
        type: TaskType.Unknown,
        rawType: rawType,
        status,
        assignee,
        annotationCount,
        updatedAt,
        meta,
      };
    }
  } else {
    logAnomaly(id, 'type', rawType, `Missing/invalid type. Defaulted to Unknown type`);
    return {
      id,
      title,
      type: TaskType.Unknown,
      rawType: 'unknown',
      status,
      assignee,
      annotationCount,
      updatedAt,
      meta,
    };
  }
}

export function normalizeTasksList(rawItems: unknown): Task[] {
  if (!Array.isArray(rawItems)) {
    console.error('[Normalizer Error] rawItems is not an array:', rawItems);
    return [];
  }
  return rawItems.map((item) => normalizeTask(item));
}
