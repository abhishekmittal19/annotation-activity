import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  wsTaskUpdated,
  wsTaskAssigned,
  wsAnnotationCreated,
  fetchSingleTask,
} from '@/store/tasksSlice';

export function useTaskFeed() {
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef<number>(1000); // starts at 1 second

  // Cache existing task IDs in a ref to avoid stale closures in ws.onmessage
  const taskIdsRef = useRef<Set<string>>(new Set());
  const taskIds = useSelector((state: RootState) => state.tasks.ids);

  useEffect(() => {
    taskIdsRef.current = new Set(taskIds.map(String));
  }, [taskIds]);

  useEffect(() => {
    let active = true;

    function connect() {
      if (!active) return;
      if (wsRef.current) return;

      setStatus('connecting');
      // Connect to the mock-server WebSocket endpoint
      const ws = new WebSocket('ws://localhost:4000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) {
          ws.close();
          return;
        }
        console.log('[WebSocket] Connection established');
        setStatus('connected');
        reconnectDelayRef.current = 1000; // Reset reconnection delay
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const message = JSON.parse(event.data);
          const { kind, payload } = message;
          if (!kind || !payload) return;

          let targetTaskId: string | null = null;
          if (kind === 'task.updated' || kind === 'task.assigned') {
            targetTaskId = payload.id;
          } else if (kind === 'annotation.created') {
            targetTaskId = payload.taskId;
          }

          if (!targetTaskId) return;

          // Check if we have already loaded this task in our store
          const exists = taskIdsRef.current.has(targetTaskId);

          if (!exists) {
            console.log(`[WebSocket] Event "${kind}" references unloaded task "${targetTaskId}". Fetching task details...`);
            dispatch(fetchSingleTask(targetTaskId));
            return;
          }

          // Process known task event
          switch (kind) {
            case 'task.updated':
              dispatch(wsTaskUpdated({
                id: payload.id,
                status: payload.status,
                updatedAt: payload.updatedAt || Date.now(),
              }));
              break;

            case 'task.assigned':
              dispatch(wsTaskAssigned({
                id: payload.id,
                assignee: payload.assignee,
              }));
              break;

            case 'annotation.created':
              dispatch(wsAnnotationCreated({
                taskId: payload.taskId,
              }));
              break;

            default:
              console.warn('[WebSocket] Unknown event kind:', kind);
          }
        } catch (err) {
          console.error('[WebSocket] Error processing message:', err);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!active) return;
        
        setStatus('disconnected');
        const delay = reconnectDelayRef.current;
        console.log(`[WebSocket] Closed. Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(delay * 2, 30000); // Cap backoff at 30 seconds
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Socket encountered error:', err);
        // Let the onclose callback handle scheduling reconnection
        ws.close();
      };
    }

    connect();

    return () => {
      active = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [dispatch]);

  return status;
}
