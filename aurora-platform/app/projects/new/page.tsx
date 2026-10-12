"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { projectApi, ProjectTaskType } from "@/lib/api/project";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<ProjectTaskType>(
    "text-classification",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    setLoading(true);

    try {
      await projectApi.create({
        name: name.trim(),
        description: description.trim(),
        taskType,
      });

      router.push("/projects");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create project.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="mb-4 text-sm text-slate-400 hover:text-white"
          >
            ← Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-slate-100">
            Create a Project
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Set up a project for your annotation workflow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-slate-200">
              Project name *
            </label>
            <input
              id="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Feedback Classification"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm text-slate-200"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project's goal."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label
              htmlFor="taskType"
              className="mb-2 block text-sm text-slate-200"
            >
              Annotation type *
            </label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as ProjectTaskType)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            >
              <option value="text-classification">Text Classification</option>
              <option value="text-annotation">Text Annotation</option>
              <option value="image-annotation">Image Annotation</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating project..." : "Create Project"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
