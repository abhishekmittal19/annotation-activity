"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import { usersApi, User } from "@/lib/api/users";
import { TaskItem, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 20;

export function TaskManagementTable() {
  // =========================
  // Table / Filter State
  // =========================
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "ALL">(
    "ALL",
  );

  const [selectedPriority, setSelectedPriority] = useState<
    TaskPriority | "ALL"
  >("ALL");
  const [page, setPage] = useState(1);

  // =========================
  // Create Task State
  // =========================
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDataset, setNewDataset] = useState("Autonomous Perception v4");
  const [newPriority, setNewPriority] = useState<TaskPriority>("HIGH");
  const [newType, setNewType] = useState<TaskType>("IMAGE_BOUNDING_BOX");

  // =========================
  // Edit Task State
  // =========================
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("MEDIUM");
  const [editType, setEditType] = useState<TaskType>("IMAGE_BOUNDING_BOX");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTask, setAssigningTask] = useState<TaskItem | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  // =========================
  // Load Tasks
  // =========================
  const {
    data: taskResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tasks", page, selectedStatus, selectedPriority],
    queryFn: () =>
      tasksApi.getTasks({
        page,
        pageSize: PAGE_SIZE,
        ...(selectedStatus !== "ALL" ? { status: selectedStatus } : {}),
        ...(selectedPriority !== "ALL" ? { priority: selectedPriority } : {}),
      }),
  });

  const tasks = taskResponse?.items ?? [];
  const total = taskResponse?.total ?? 0;

  // =========================
  // Search
  // =========================
  const filteredTasks = tasks.filter((task: TaskItem) => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) return true;

    return (
      task.title?.toLowerCase().includes(searchTerm) ||
      task.id?.toLowerCase().includes(searchTerm) ||
      task.datasetName?.toLowerCase().includes(searchTerm)
    );
  });

  // =========================
  // Pagination
  // =========================
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // =========================
  // Filters
  // =========================
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as TaskStatus | "ALL");
    setPage(1);
  };

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value as TaskPriority | "ALL");
    setPage(1);
  };
  // =========================
  // Create Task
  // =========================
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    try {
      await tasksApi.createTask({
        title: newTitle.trim(),
        datasetName: newDataset,
        imageUrl:
          "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1200&q=80",

        priority: newPriority,

        assigneeId: "user-annotator-1",
      });

      setShowCreateModal(false);
      setNewTitle("");

      await refetch();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // =========================
  // Open Edit Modal
  // =========================
  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);

    setEditTitle(task.title || "");

    setEditPriority(task.priority);

    setEditType(
      task.type === "TEXT_CLASSIFICATION"
        ? "TEXT_CLASSIFICATION"
        : "IMAGE_BOUNDING_BOX",
    );

    setShowEditModal(true);
  };

  const handleUnassignTask = async (task: TaskItem) => {
    try {
      await tasksApi.unassignTask(task.id);

      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    } catch (error) {
      console.error("Failed to unassign task:", error);
    }
  };

  // =========================
  // Close Edit Modal
  // =========================
  const closeEditModal = () => {
    if (isUpdating) return;

    setShowEditModal(false);
    setEditingTask(null);
    setEditTitle("");
    setEditPriority("MEDIUM");
    setEditType("IMAGE_BOUNDING_BOX");
  };

  // =========================
  // Update Task
  // =========================
  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    if (!editTitle.trim()) return;

    try {
      setIsUpdating(true);

      await tasksApi.updateTask(editingTask.id, {
        title: editTitle.trim(),

        // Frontend type -> backend type
        type:
          editType === "IMAGE_BOUNDING_BOX" ||
          editType === "POLYGON_SEGMENTATION" ||
          editType === "KEYPOINT_POSE"
            ? "image"
            : "text",

        // Frontend priority
        priority: editPriority.toLowerCase() as "low" | "medium" | "high",
      });
      closeEditModal();

      await refetch();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      setIsDeleting(true);

      await tasksApi.deleteTask(deletingTask.id);

      setDeletingTask(null);

      // Refresh the task list
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);

      const allUsers = await usersApi.getUsers();

      const annotators = allUsers.filter(
        (user) => user.role.toLowerCase() === "annotator",
      );

      setUsers(annotators);
    } catch (error) {
      console.error("Failed to load annotators:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const openAssignModal = async (task: TaskItem) => {
    setAssigningTask(task);
    setSelectedAssignee("");
    setShowAssignModal(true);

    await loadUsers();
  };

  // const handleAssignTask = async () => {
  //   if (!assigningTask || !selectedAssignee) return;

  //   try {
  //     setIsAssigning(true);

  //     await tasksApi.assignTask(assigningTask.id, selectedAssignee);

  //     setShowAssignModal(false);
  //     setAssigningTask(null);
  //     setSelectedAssignee("");

  //     await queryClient.invalidateQueries({
  //       queryKey: ["tasks"],
  //     });
  //   } catch (error) {
  //     console.error("Failed to assign task:", error);
  //   } finally {
  //     setIsAssigning(false);
  //   }
  // };
  const handleAssignTask = async () => {
    if (!assigningTask || !selectedAssignee) return;

    try {
      setIsAssigning(true);

      await tasksApi.assignTask(assigningTask.id, selectedAssignee);

      setShowAssignModal(false);
      setAssigningTask(null);
      setSelectedAssignee("");

      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    } catch (error) {
      console.error("Failed to assign task:", error);
    } finally {
      setIsAssigning(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Task Operations & Lifecycle Management
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Enterprise batch allocation, status filtering, and bulk lifecycle
            actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task Batch</span>
        </button>
      </div>

      {/* =========================
          Filter Bar
      ========================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task ID, title, dataset..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />

            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REWORK_REQUIRED">Rework Required</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* =========================
          Error
      ========================= */}
      {isError && (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-300">
          Failed to load tasks from the backend.
        </div>
      )}

      {/* =========================
          Task Table
      ========================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80">
                <th className="p-4 font-semibold">Task ID</th>

                <th className="p-4 font-semibold">Title & Dataset</th>

                <th className="p-4 font-semibold">Priority</th>

                <th className="p-4 font-semibold">Current Lifecycle Status</th>

                <th className="p-4 font-semibold">Assignee</th>

                <th className="p-4 font-semibold">Revision</th>

                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-16" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-48" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-12" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-24" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-20" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-10" />
                    </td>

                    <td className="p-4">
                      <div className="h-4 bg-slate-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No tasks found matching your active filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task: TaskItem) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {task.id}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-100">
                        {task.title}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {task.datasetName}
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          task.priority === "URGENT"
                            ? "bg-rose-950 text-rose-300 border-rose-800"
                            : task.priority === "HIGH"
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={task.status} size="sm" />
                    </td>

                    <td className="p-4 text-slate-300">
                      {task.assigneeId || "Unassigned"}
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      v{task.revisionVersion ?? 1}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {task.assigneeId ? (
                          <button
                            type="button"
                            onClick={() => handleUnassignTask(task)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 font-semibold text-[11px] border border-amber-800 transition-all"
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAssignModal(task)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-semibold text-[11px] border border-cyan-800 transition-all"
                          >
                            Assign
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-semibold text-[11px] border border-indigo-800 transition-all"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingTask(task)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* =========================
    Assign Task Modal
========================= */}
                        {showAssignModal && assigningTask && (
                          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                              <div>
                                <h3 className="text-base font-bold text-slate-100">
                                  Assign Annotation Task
                                </h3>

                                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                                  {assigningTask.id}
                                </p>

                                <p className="text-xs text-slate-400 mt-3">
                                  {assigningTask.title}
                                </p>
                              </div>

                              <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                  Select Annotator
                                </label>

                                <select
                                  value={selectedAssignee}
                                  onChange={(e) =>
                                    setSelectedAssignee(e.target.value)
                                  }
                                  disabled={isLoadingUsers || isAssigning}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="">
                                    {isLoadingUsers
                                      ? "Loading annotators..."
                                      : "Select an annotator"}
                                  </option>

                                  {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                      {user.name} — {user.email}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {!isLoadingUsers && users.length === 0 && (
                                <p className="text-xs text-amber-400">
                                  No annotators are available.
                                </p>
                              )}

                              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                  type="button"
                                  disabled={isAssigning}
                                  onClick={() => {
                                    setShowAssignModal(false);
                                    setAssigningTask(null);
                                  }}
                                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isAssigning ||
                                    isLoadingUsers ||
                                    !selectedAssignee
                                  }
                                  onClick={handleAssignTask}
                                  className="px-5 py-2 rounded bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 disabled:opacity-50"
                                >
                                  {isAssigning ? "Assigning..." : "Assign Task"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {deletingTask && (
                          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-950 border border-red-800">
                                  <Trash2 className="h-5 w-5 text-red-400" />
                                </div>

                                <div>
                                  <h3 className="text-base font-bold text-slate-100">
                                    Delete Task
                                  </h3>

                                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                                    {deletingTask.id}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-5 text-sm text-slate-300">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-white">
                                  {deletingTask.title}
                                </span>
                                ?
                              </p>

                              <p className="mt-2 text-xs text-red-400">
                                This action cannot be undone.
                              </p>

                              <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-slate-800">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => setDeletingTask(null)}
                                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={handleDeleteTask}
                                  className="px-5 py-2 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50"
                                >
                                  {isDeleting ? "Deleting..." : "Delete Task"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inspect */}
                        <Link
                          href={`/tasks/${task.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] border border-slate-700 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =========================
            Pagination
        ========================= */}
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
          <p className="text-[11px] text-slate-500">
            Page <span className="text-slate-300">{page}</span> of{" "}
            <span className="text-slate-300">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          Create Task Modal
      ========================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Create & Assign New Annotation Task
            </h3>

            <div className="space-y-3 text-xs">
              {/* Title */}
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>

                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Camera Front 4K - Urban Sequence #109"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                />
              </div>

              {/* Dataset */}
              <div>
                <label className="block text-slate-400 mb-1">
                  Dataset Name
                </label>

                <input
                  type="text"
                  value={newDataset}
                  onChange={(e) => setNewDataset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                />
              </div>

              {/* Annotation Type */}
              <div>
                <label className="block text-slate-400 mb-1">
                  Annotation Type
                </label>

                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TaskType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                >
                  <option value="IMAGE_BOUNDING_BOX">Image Bounding Box</option>

                  <option value="POLYGON_SEGMENTATION">
                    Polygon Segmentation
                  </option>

                  <option value="TEXT_CLASSIFICATION">
                    Text Classification
                  </option>

                  <option value="KEYPOINT_POSE">Keypoint Pose</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-slate-400 mb-1">Priority</label>

                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as TaskPriority)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                >
                  {/* <option value="URGENT">Urgent</option> */}

                  <option value="HIGH">High</option>

                  <option value="MEDIUM">Medium</option>

                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          Edit Task Modal
      ========================= */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleEditTask}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-400" />
                Edit Annotation Task
              </h3>

              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {editingTask.id}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Title */}
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>

                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Annotation Type */}
              <div>
                <label className="block text-slate-400 mb-1">
                  Annotation Type
                </label>

                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as TaskType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                >
                  <option value="IMAGE_BOUNDING_BOX">Image Bounding Box</option>

                  <option value="POLYGON_SEGMENTATION">
                    Polygon Segmentation
                  </option>

                  <option value="TEXT_CLASSIFICATION">
                    Text Classification
                  </option>

                  <option value="KEYPOINT_POSE">Keypoint Pose</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-slate-400 mb-1">Priority</label>

                <select
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value as TaskPriority)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                >
                  <option value="HIGH">High</option>

                  <option value="MEDIUM">Medium</option>

                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isUpdating}
                onClick={closeEditModal}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating || !editTitle.trim()}
                className="px-5 py-2 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
