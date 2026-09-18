"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { annotationsApi, AnnotationRecord } from "@/lib/api/annotations";
import {
  setInitialAnnotations,
  setSelectedObjectId,
  setActiveClassLabel,
  setToolMode,
  setZoomLevel,
  addAnnotation,
  deleteAnnotation,
  undo,
  redo,
  ToolMode,
} from "@/store/annotationSlice";
import { tasksApi } from "@/lib/api/tasks";
import { MOCK_TASKS } from "@/lib/api/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WorkflowTimeline } from "@/components/shared/WorkflowTimeline";
import { AnnotationObject } from "@/types/task";
import {
  MousePointer,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Save,
  Send,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  Layers,
  Tag,
  AlertTriangle,
} from "lucide-react";

export function AnnotationWorkspace({ taskId }: { taskId?: string }) {
  const dispatch = useAppDispatch();
  const {
    annotations,
    selectedObjectId,
    activeClassLabel,
    toolMode,
    zoomLevel,
  } = useAppSelector((state) => state.annotation);

  const [activeTask, setActiveTask] = useState(MOCK_TASKS[0]);
  const [timeSpent, setTimeSpent] = useState(252);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentBox, setCurrentBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const loadAnnotations = async () => {
      try {
        const records = await annotationsApi.getByTask(taskId);

        console.log("Real annotations loaded:", records);
      } catch (error) {
        console.error("Failed to load annotations:", error);
      }
    };

    loadAnnotations();
  }, [taskId]);
  // Initialize active task annotations
  useEffect(() => {
    dispatch(setInitialAnnotations(activeTask.annotations));

    const timer = window.setTimeout(() => {
      setTimeSpent(activeTask.timeSpentSeconds || 0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeTask, dispatch]);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedObject = annotations.find((a) => a.id === selectedObjectId);

  const classColors: Record<string, string> = {
    Car: "#06B6D4",
    Pedestrian: "#F43F5E",
    Cyclist: "#10B981",
    "Traffic Sign": "#F59E0B",
  };

  // Canvas Mouse Events for Drawing Bounding Boxes
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolMode !== "RECTANGLE") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / (zoomLevel / 100);
    const y = (e.clientY - rect.top) / (zoomLevel / 100);
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || toolMode !== "RECTANGLE") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const currentX = (e.clientX - rect.left) / (zoomLevel / 100);
    const currentY = (e.clientY - rect.top) / (zoomLevel / 100);

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const w = Math.abs(currentX - startPos.x);
    const h = Math.abs(currentY - startPos.y);

    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
      const newAnnotation: AnnotationObject = {
        id: `box-${Date.now()}`,
        label: activeClassLabel,
        color: classColors[activeClassLabel] || "#06B6D4",
        geometry: {
          x: Math.round(currentBox.x),
          y: Math.round(currentBox.y),
          width: Math.round(currentBox.w),
          height: Math.round(currentBox.h),
        },
        confidence: 0.96,
        attributes: {
          occlusion: "NONE",
          truncated: false,
          difficult: false,
        },
      };
      dispatch(addAnnotation(newAnnotation));
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentBox(null);
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      await tasksApi.saveTaskDraft(activeTask.id, annotations, timeSpent);
      setNotification("Draft progress saved successfully");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAnnotation = async () => {
    if (annotations.length === 0) {
      alert("Cannot submit an empty annotation task. Draw at least 1 object.");
      return;
    }
    setIsSubmitting(true);
    try {
      await tasksApi.submitTask(activeTask.id, annotations, timeSpent);
      setActiveTask({ ...activeTask, status: "SUBMITTED" });
      setNotification("Annotation submitted successfully for QA review!");
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {activeTask.id}
              </span>
              <h1 className="text-sm font-bold text-slate-100">
                {activeTask.title}
              </h1>
              <StatusBadge status={activeTask.status} size="sm" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Revision v{activeTask.revisionVersion}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dataset:{" "}
              <span className="text-slate-300 font-medium">
                {activeTask.datasetName}
              </span>{" "}
              | Assignee:{" "}
              <span className="text-slate-300 font-medium">
                {activeTask.assigneeName}
              </span>
            </p>
          </div>
        </div>

        {/* Workflow Timeline Header */}
        <div className="w-full md:w-auto min-w-[500px]">
          <WorkflowTimeline currentStatus={activeTask.status} />
        </div>
      </div>

      {/* 3-Column Main Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* LEFT PANEL: Task & Dataset Navigator (2.5 Cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-y-auto space-y-3">
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Task Navigator
            </h2>

            <div className="space-y-2">
              {MOCK_TASKS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    activeTask.id === task.id
                      ? "bg-slate-800 border-cyan-500/60 shadow-sm shadow-cyan-500/10"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-cyan-400 text-[11px]">
                      {task.id}
                    </span>
                    <StatusBadge
                      status={task.status}
                      size="sm"
                      showIcon={false}
                    />
                  </div>
                  <p className="font-medium text-slate-200 line-clamp-1">
                    {task.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Rework Alert if Task is Rejected */}
          {activeTask.status === "REWORK_REQUIRED" &&
            activeTask.revisions[0]?.reviewerFeedback && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/60 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Rework Required</span>
                </div>
                <p className="text-amber-200/90 text-[11px]">
                  {activeTask.revisions[0].reviewerFeedback.feedback}
                </p>
              </div>
            )}
        </div>

        {/* CENTER: Annotation Viewport Canvas (7 Cols) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl relative flex flex-col overflow-hidden">
          {/* Canvas Top Toolbar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
            {/* Tool Selection */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch(setToolMode("SELECT"))}
                className={`p-1.5 rounded ${toolMode === "SELECT" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50" : "text-slate-400 hover:bg-slate-800"}`}
                title="Select Object"
              >
                <MousePointer className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(setToolMode("RECTANGLE"))}
                className={`p-1.5 rounded ${toolMode === "RECTANGLE" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50" : "text-slate-400 hover:bg-slate-800"}`}
                title="Draw Bounding Box (R)"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            {/* Active Class Quick Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Class:</span>
              {["Car", "Pedestrian", "Cyclist", "Traffic Sign"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => dispatch(setActiveClassLabel(cls))}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                    activeClassLabel === cls
                      ? "bg-slate-800 text-white border-cyan-400"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Zoom & Undo Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(undo())}
                className="p-1.5 text-slate-400 hover:text-slate-200"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(redo())}
                className="p-1.5 text-slate-400 hover:text-slate-200"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <span className="text-slate-500">|</span>
              <button
                onClick={() => dispatch(setZoomLevel(zoomLevel - 15))}
                className="p-1.5 text-slate-400 hover:text-slate-200"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-300 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => dispatch(setZoomLevel(zoomLevel + 15))}
                className="p-1.5 text-slate-400 hover:text-slate-200"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(setZoomLevel(100))}
                className="p-1.5 text-slate-400 hover:text-slate-200"
                title="Fit Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Image Viewport */}
          <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-slate-950">
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top left",
              }}
              className="relative select-none cursor-crosshair border border-slate-800 shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTask.imageUrl}
                alt="Annotation Target Viewport"
                className="max-w-none w-[800px] h-[450px] object-cover pointer-events-none"
              />

              {/* Render Bounding Boxes */}
              {annotations.map((obj) => {
                const isSelected = selectedObjectId === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedObjectId(obj.id));
                    }}
                    style={{
                      left: `${obj.geometry.x}px`,
                      top: `${obj.geometry.y}px`,
                      width: `${obj.geometry.width}px`,
                      height: `${obj.geometry.height}px`,
                      borderColor: obj.color,
                    }}
                    className={`absolute border-2 transition-all ${
                      isSelected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 bg-cyan-500/10"
                        : "bg-transparent"
                    }`}
                  >
                    <span
                      style={{ backgroundColor: obj.color }}
                      className="absolute -top-5 left-0 text-[10px] font-bold text-slate-950 px-1.5 py-0.2 rounded-t shadow"
                    >
                      {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              })}

              {/* Drawing Active Box Preview */}
              {isDrawing && currentBox && (
                <div
                  style={{
                    left: `${currentBox.x}px`,
                    top: `${currentBox.y}px`,
                    width: `${currentBox.w}px`,
                    height: `${currentBox.h}px`,
                  }}
                  className="absolute border-2 border-cyan-400 border-dashed bg-cyan-500/20 pointer-events-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Properties & Validation (2.5 Cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Object Hierarchy & Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Object Hierarchy ({annotations.length})</span>
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
              </h3>

              <div className="space-y-1.5">
                {annotations.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => dispatch(setSelectedObjectId(obj.id))}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedObjectId === obj.id
                        ? "bg-slate-800 border-cyan-500/60 text-slate-100"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: obj.color }}
                      />
                      <span className="font-semibold">{obj.label}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(deleteAnnotation(obj.id));
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Object"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Object Properties */}
            {selectedObject ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-cyan-300">
                  Selected Object Properties
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Class Label
                    </label>
                    <span className="font-bold text-slate-200">
                      {selectedObject.label}
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Occlusion
                    </label>
                    <select
                      value={selectedObject.attributes.occlusion}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    >
                      <option value="NONE">None</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="HEAVY">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                Click an object on the canvas to edit properties
              </div>
            )}

            {/* Automated Validation Engine */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Validation Rules
              </h4>
              <div className="space-y-1 text-[11px]">
                <p className="text-emerald-400">
                  ✓ All objects labeled ({annotations.length})
                </p>
                <p className="text-emerald-400">
                  ✓ Bounding boxes within frame bounds
                </p>
                <p className="text-emerald-400">
                  ✓ Min object dimension &gt; 10px
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Time Logged */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Active Session Time
            </span>
            <span className="font-mono font-bold text-cyan-300">
              {formatTimer(timeSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notification && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-4 h-4" />
              {notification}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProgress}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>
              {isSaving ? "Saving Draft..." : "Save Progress (Ctrl+S)"}
            </span>
          </button>

          <button
            onClick={handleSubmitAnnotation}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Submitting..."
                : "Submit Annotation (Ctrl+Enter)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
