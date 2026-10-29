"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { projectApi, type Project } from "@/lib/api/project";
import { datasetApi, type Dataset } from "@/lib/api/dataset";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  console.log(">>>>>",file);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProjectData() {
      try {
        const projects = await projectApi.getMyProjects();
        const currentProject = projects.find((item) => item._id === projectId);

        if (!currentProject) {
          throw new Error("Project not found or you don't have access to it.");
        }

        const projectDatasets = await datasetApi.getByProject(projectId);

        if (!cancelled) {
          setProject(currentProject);
          setDatasets(projectDatasets);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load project.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (projectId) loadProjectData();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError("");
    setSuccess("");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a CSV or JSON file.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "csv" && extension !== "json") {
      setError("Only CSV and JSON files are supported.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const uploadedDataset = await datasetApi.upload(projectId, file);
      setDatasets((current) => [uploadedDataset, ...current]);
      setFile(null);
      setSuccess("Dataset uploaded successfully.");

      const input = document.getElementById(
        "dataset-file",
      ) as HTMLInputElement | null;

      if (input) input.value = "";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload dataset.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← Back to Projects
        </button>

        {loading ? (
          <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">
            Loading project...
          </div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {project && (
              <>
                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-100">
                        {project.name}
                      </h1>
                      <p className="mt-2 text-sm text-slate-400">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm capitalize text-slate-400">
                    Annotation type: {project.taskType.replaceAll("-", " ")}
                  </p>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                  <h2 className="text-lg font-semibold text-slate-100">
                    Upload Dataset
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Upload a CSV or JSON file containing records for this
                    project. Maximum file size: 5 MB.
                  </p>

                  <form onSubmit={handleUpload} className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor="dataset-file"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Choose file
                      </label>
                      <input
                        id="dataset-file"
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
                      />
                    </div>

                    {file && (
                      <p className="text-sm text-slate-400">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)}{" "}
                        KB)
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload Dataset"}
                    </button>
                  </form>

                  {success && (
                    
                    <p
                      role="status"
                      className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3 text-sm text-emerald-300"
                    >
                      {success}
                    </p>
                  )}
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      Uploaded Datasets
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {datasets.length} dataset
                      {datasets.length === 1 ? "" : "s"} uploaded
                    </p>
                  </div>

                  {datasets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                      No datasets uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {datasets.map((dataset) => (
                        <article
                          key={dataset._id}
                          className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-medium text-slate-100">
                                {dataset.originalFileName || dataset.name}
                              </h3>
                              <p className="mt-1 text-sm text-slate-400">
                                {dataset.recordCount} records
                              </p>
                            </div>

                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs uppercase text-slate-300">
                              {dataset.fileType}
                            </span>
                          </div>

                          <p className="mt-3 text-xs text-slate-500">
                            Uploaded{" "}
                            {new Date(dataset.createdAt).toLocaleString()}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
