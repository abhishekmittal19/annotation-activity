"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { projectApi, Project } from "@/lib/api/project";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const result = await projectApi.getMyProjects();
        if (!cancelled) setProjects(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load projects.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your annotation projects in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/projects/new")}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + Create Project
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-100">
              No projects yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Create your first project to get started with annotation.
            </p>
            <button
              type="button"
              onClick={() => router.push("/projects/new")}
              className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project._id}
                onClick={() => router.push(`/projects/${project._id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/projects/${project._id}`);
                  }
                }}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-indigo-500/60 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-100">
                    {project.name}
                  </h2>
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs capitalize text-slate-300">
                    {project.status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  {project.description || "No description provided."}
                </p>

                <div className="mt-4 border-t border-slate-800 pt-4">
                  <p className="text-xs text-slate-500">Annotation type</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {project.taskType.replaceAll("-", " ")}
                  </p>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
