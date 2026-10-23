import { Dataset } from "../models/dataset.model";
import { Project } from "../models/project.model";

type UploadedFile = Express.Multer.File;

function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"' && inQuotes && content[i + 1] === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[i + 1] === "\n") i++;

      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw new Error("CSV contains an unclosed quoted field.");
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    throw new Error("CSV must contain a header row and at least one record.");
  }

  const headers = rows[0].map((header) => header.trim());

  if (
    headers.some((header) => !header) ||
    new Set(headers).size !== headers.length
  ) {
    throw new Error("CSV headers must be non-empty and unique.");
  }

  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(
        `CSV row ${index + 2} has ${values.length} columns; expected ${headers.length}.`,
      );
    }

    return Object.fromEntries(
      headers.map((header, column) => [header, values[column]]),
    );
  });
}

function parseJson(content: string): Record<string, unknown>[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("The uploaded file contains invalid JSON.");
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    !parsed.every(
      (record) =>
        record !== null && typeof record === "object" && !Array.isArray(record),
    )
  ) {
    throw new Error(
      'JSON must be a non-empty array of objects, such as [{"text":"Example"}].',
    );
  }

  return parsed as Record<string, unknown>[];
}

export async function createDataset(
  projectId: string,
  file: UploadedFile,
  userId: string,
) {
  if (!file || !file.buffer || file.size === 0) {
    throw new Error("Please upload a non-empty file.");
  }

  const extension = file.originalname.split(".").pop()?.toLowerCase();

  if (extension !== "csv" && extension !== "json") {
    throw new Error("Only CSV and JSON files are supported.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must not exceed 5 MB.");
  }

  const project = await Project.findOne({
    _id: projectId,
    createdBy: userId,
  });

  if (!project) {
    throw new Error("Project not found or you do not have access to it.");
  }

  const content = file.buffer.toString("utf8");

  if (content.includes("\u0000")) {
    throw new Error("The uploaded file contains invalid text data.");
  }

  const records = extension === "csv" ? parseCsv(content) : parseJson(content);

  if (records.length > 10000) {
    throw new Error("A dataset cannot contain more than 10,000 records.");
  }

  return Dataset.create({
    name: file.originalname,
    projectId: project._id,
    fileType: extension,
    originalFileName: file.originalname,
    records,
    recordCount: records.length,
    uploadedBy: userId,
  });
}
