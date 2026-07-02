import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface TaskSummaryStreamProps {
  taskId: string;
}

export function TaskSummaryStream({ taskId }: TaskSummaryStreamProps) {
  const [summary, setSummary] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 1. Reset state for new task
    setSummary('');
    setError(null);
    setIsStreaming(true);

    // Close any previous stream
    if (eventSourceRef.current) {
      console.log(`[SSE] Closing active stream to open a new one for task: ${taskId}`);
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 2. Establish Server-Sent Events connection
    const url = `http://localhost:4000/api/tasks/${taskId}/summary`;
    console.log(`[SSE] Subscribing to stream: ${url}`);
    
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // Receive message chunks (default message event)
    es.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);
        if (typeof chunk === 'string') {
          setSummary((prev) => prev + chunk);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse message chunk:', err);
      }
    };

    // Listen for custom 'done' event from the server
    es.addEventListener('done', () => {
      console.log('[SSE] Stream ended normally by server');
      setIsStreaming(false);
      es.close();
      eventSourceRef.current = null;
    });

    // Handle connection or server errors
    es.onerror = (err) => {
      console.error('[SSE] EventSource error occurred:', err);
      setError('Connection interrupted or failed to load streamed summary.');
      setIsStreaming(false);
      es.close();
      eventSourceRef.current = null;
    };

    // Cleanup: close stream on unmount or taskId change
    return () => {
      if (es) {
        console.log(`[SSE] Cleaning up stream subscription for task: ${taskId}`);
        es.close();
      }
    };
  }, [taskId]);

  // Convert markdown to HTML safely using marked and DOMPurify
  const getSanitizedHtml = () => {
    try {
      const rawHtml = marked.parse(summary) as string;
      // Configure DOMPurify to allow standard markdown rendering layout, but completely block script execution and invalid attributes
      return { __html: DOMPurify.sanitize(rawHtml) };
    } catch (err) {
      console.error('Markdown parsing or sanitization error:', err);
      return { __html: '<p className="text-rose-500">Error rendering summary content.</p>' };
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">AI-Generated Summary</h3>
        </div>
        
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Streaming...</span>
          </div>
        )}
        
        {!isStreaming && !error && summary && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-rose-950/45 border border-rose-800/40 rounded-md flex items-start gap-2 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {summary ? (
        <article 
          className="prose prose-slate prose-invert max-w-none text-sm text-slate-300 space-y-2
                     prose-headings:font-bold prose-headings:text-slate-100 prose-headings:mt-3 prose-headings:mb-1
                     prose-h2:text-base prose-h3:text-sm
                     prose-p:leading-relaxed
                     prose-code:text-indigo-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                     prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:p-3 prose-pre:rounded-lg prose-pre:text-xs prose-pre:overflow-x-auto
                     prose-ul:list-disc prose-ul:pl-4 prose-li:my-1"
          dangerouslySetInnerHTML={getSanitizedHtml()}
        />
      ) : (
        !error && (
          <div className="text-slate-500 text-xs py-8 text-center flex flex-col items-center justify-center gap-2">
            {isStreaming ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <span>Initializing summary stream...</span>
              </>
            ) : (
              <span>No summary loaded yet.</span>
            )}
          </div>
        )
      )}
    </div>
  );
}
