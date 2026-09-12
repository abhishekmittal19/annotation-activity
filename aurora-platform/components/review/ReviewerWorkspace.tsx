'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { tasksApi } from '@/lib/api/tasks';
import { MOCK_TASKS } from '@/lib/api/mockData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WorkflowTimeline } from '@/components/shared/WorkflowTimeline';
import { RejectionSeverity } from '@/types/task';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Layers,
  MessageSquare,
  Clock,
  Star,
  User,
  Sliders,
  Check,
} from 'lucide-react';

export function ReviewerWorkspace() {
  const [activeTask, setActiveTask] = useState(MOCK_TASKS[1]); // AUR-84921 submitted task
  const [diffMode, setDiffMode] = useState<'OVERLAY' | 'SPLIT'>('OVERLAY');
  const [activeRevision, setActiveRevision] = useState<number>(1);

  // QA Checklist State
  const [checklist, setChecklist] = useState({
    correctLabels: true,
    correctBoundaries: true,
    noMissingObjects: true,
    attributesCorrect: true,
    guidelinesFollowed: true,
  });

  // Modal States
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Approval Form
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Rejection Form
  const [rejectionReason, setRejectionReason] = useState('Loose Bounding Box / Boundary Padding');
  const [severity, setSeverity] = useState<RejectionSeverity>('MAJOR');
  const [problematicObjectId, setProblematicObjectId] = useState<string>('box-101');
  const [detailedFeedback, setDetailedFeedback] = useState(
    'Bounding box #1 has excessive margin padding on the top and right edges. Please snap boundaries tightly to the vehicle contour per Section 3.2.'
  );
  const [requiredCorrection, setRequiredCorrection] = useState(
    '1. Tighten top boundary margin by ~12px\n2. Re-evaluate occlusion score'
  );

  const [notification, setNotification] = useState<string | null>(null);

  const allChecklistPassed = Object.values(checklist).every(Boolean);

  const handleConfirmApproval = async () => {
    try {
      await tasksApi.reviewTask(activeTask.id, 'APPROVE', {
        rating: qualityRating,
      });
      setActiveTask({ ...activeTask, status: 'APPROVED' });
      setShowApprovalModal(false);
      setNotification('Task approved successfully and queued for dataset export!');
      setTimeout(() => setNotification(null), 4000);
    } catch {
      alert('Error submitting approval');
    }
  };

  const handleConfirmRejection = async () => {
    try {
      await tasksApi.reviewTask(activeTask.id, 'REJECT', {
        rejectionReason,
        severity,
        feedback: detailedFeedback,
        requiredCorrections: requiredCorrection.split('\n').filter(Boolean),
      });
      setActiveTask({ ...activeTask, status: 'REWORK_REQUIRED' });
      setShowRejectionModal(false);
      setNotification('Task rejected. Rework package sent to Annotator Alex Rivera.');
      setTimeout(() => setNotification(null), 4000);
    } catch {
      alert('Error submitting rejection');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400 text-sm">{activeTask.id}</span>
              <h1 className="text-sm font-bold text-slate-100">{activeTask.title}</h1>
              <StatusBadge status={activeTask.status} size="sm" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                QA Review Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Annotator: <span className="text-slate-200 font-semibold">{activeTask.assigneeName}</span> (96.4% QA Pass Rate) | SLA Deadline:{' '}
              <span className="text-slate-300 font-mono">{new Date(activeTask.slaDeadline).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Workflow Timeline Header */}
        <div className="w-full md:w-auto min-w-[500px]">
          <WorkflowTimeline currentStatus={activeTask.status} />
        </div>
      </div>

      {/* Main 3-Column Reviewer Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* LEFT PANEL: Review Queue & Revision Switcher (2.5 Cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-y-auto space-y-3">
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Review Queue
            </h2>

            <div className="space-y-2">
              {MOCK_TASKS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    activeTask.id === task.id
                      ? 'bg-slate-800 border-purple-500/60 shadow-sm shadow-purple-500/10'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-cyan-400 text-[11px]">{task.id}</span>
                    <StatusBadge status={task.status} size="sm" showIcon={false} />
                  </div>
                  <p className="font-medium text-slate-200 line-clamp-1">{task.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Previous Revision Diff Controls */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
            <h3 className="font-bold text-purple-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Revision Diff Engine
            </h3>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800">
              <button
                onClick={() => setDiffMode('OVERLAY')}
                className={`flex-1 py-1 text-[10px] font-bold rounded ${diffMode === 'OVERLAY' ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'text-slate-400'}`}
              >
                Ghost Overlay
              </button>
              <button
                onClick={() => setDiffMode('SPLIT')}
                className={`flex-1 py-1 text-[10px] font-bold rounded ${diffMode === 'SPLIT' ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'text-slate-400'}`}
              >
                Side-by-Side
              </button>
            </div>
          </div>
        </div>

        {/* CENTER: QA Canvas Viewport (7 Cols) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl relative flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Quality Inspection Canvas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Diff Mode:</span>
              <span className="text-[11px] font-bold text-cyan-300">{diffMode}</span>
            </div>
          </div>

          {/* Viewport */}
          <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-slate-950">
            <div className="relative border border-slate-800 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTask.imageUrl}
                alt="Review Target Viewport"
                className="max-w-none w-[800px] h-[450px] object-cover pointer-events-none"
              />

              {/* Current Revision Bounding Boxes (Green Solid) */}
              {activeTask.annotations.map((obj) => (
                <div
                  key={obj.id}
                  style={{
                    left: `${obj.geometry.x}px`,
                    top: `${obj.geometry.y}px`,
                    width: `${obj.geometry.width}px`,
                    height: `${obj.geometry.height}px`,
                  }}
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10"
                >
                  <span className="absolute -top-5 left-0 text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-t">
                    v{activeTask.revisionVersion}: {obj.label}
                  </span>
                </div>
              ))}

              {/* Previous Revision Ghost Bounding Boxes (Red Dashed) */}
              {diffMode === 'OVERLAY' && (
                <div
                  style={{ left: '190px', top: '290px', width: '360px', height: '195px' }}
                  className="absolute border-2 border-dashed border-rose-500/70 bg-rose-500/10 pointer-events-none"
                >
                  <span className="absolute -bottom-5 left-0 text-[9px] font-bold bg-rose-950 text-rose-300 px-1 border border-rose-700 rounded-b">
                    v1 Ghost (Rejected)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Quality Control Inspector & Checklist (2.5 Cols) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Annotator Profile */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  AR
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{activeTask.assigneeName || 'Alex Rivera'}</p>
                  <p className="text-[10px] text-slate-400">Accuracy: 96.4% | Completed: 342</p>
                </div>
              </div>
            </div>

            {/* AI vs Human Confidence Gauge */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <h4 className="font-bold text-slate-300">Confidence Scores</h4>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">AI Model Score:</span>
                <span className="font-mono font-bold text-emerald-400">98.4% Match</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98.4%]" />
              </div>
            </div>

            {/* Mandatory Quality Control Checklist */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5 text-xs">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Quality Control Rubric Checklist
              </h4>

              <div className="space-y-2 text-[11px]">
                {Object.entries({
                  correctLabels: 'All class labels are accurate',
                  correctBoundaries: 'Bounding box boundaries snapped tightly (<3px)',
                  noMissingObjects: 'No missing objects in viewport',
                  attributesCorrect: 'Occlusion & truncation metadata verified',
                  guidelinesFollowed: 'Project taxonomy guidelines followed',
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={(checklist as any)[key]}
                      onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* QA Execution Timer */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Active Review Time
            </span>
            <span className="font-mono font-bold text-purple-300">01:45</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (APPROVE & REJECT) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          {notification && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {notification}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRejectionModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-800 shadow-lg shadow-rose-950/30 transition-all"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Reject & Request Rework</span>
          </button>

          <button
            onClick={() => setShowApprovalModal(true)}
            disabled={!allChecklistPassed}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold shadow-lg transition-all ${
              allChecklistPassed
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Annotation</span>
          </button>
        </div>
      </div>

      {/* PRE-APPROVAL CONFIRMATION MODAL (SCR-ADM-17) */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Confirm Task Approval — {activeTask.id}
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>You are about to mark this annotation task as <strong>APPROVED</strong>.</p>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Annotator Quality Score Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setQualityRating(star)}
                      className={`p-1.5 rounded ${qualityRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="font-bold text-amber-300 ml-2">{qualityRating}/5 Stars</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
              >
                Confirm Approval & Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-FACTOR REJECTION MODAL (SCR-ADM-18) */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Reject & Issue Rework Package — {activeTask.id}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rejection Reason Category</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Loose Bounding Box / Boundary Padding">Loose Bounding Box / Boundary Padding</option>
                  <option value="Wrong Class Classification">Wrong Class Classification</option>
                  <option value="Missed Object in Viewport">Missed Object in Viewport</option>
                  <option value="Incorrect Attributes">Incorrect Attributes (Occlusion/Truncation)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Defect Severity</label>
                <div className="flex gap-2">
                  {(['MINOR', 'MAJOR', 'CRITICAL'] as RejectionSeverity[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        severity === s
                          ? s === 'CRITICAL'
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed QA Feedback</label>
                <textarea
                  rows={3}
                  value={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Actionable Required Corrections</label>
                <textarea
                  rows={2}
                  value={requiredCorrection}
                  onChange={(e) => setRequiredCorrection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Submit Rejection & Notify Annotator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
