import "dotenv/config";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Task from "./models/task.model";

const MONGO_URI = process.env.MONGO_URI!;

const statuses = ["pending", "assigned", "in_progress", "completed"] as const;

const priorities = ["low", "medium", "high"] as const;

const types = ["image", "text", "audio", "video"] as const;

async function seed() {
  await mongoose.connect(MONGO_URI);

  console.log("✅ Connected");

  await Task.deleteMany();

  const tasks = Array.from({ length: 100 }).map(() => ({
    title: faker.helpers.arrayElement([
      "Annotate MRI Scan",
      "Label Traffic Images",
      "Review OCR Document",
      "Video Bounding Box",
      "Speech Annotation",
      "Sentiment Analysis",
    ]),

    type: faker.helpers.arrayElement(types),

    status: faker.helpers.arrayElement(statuses),

    priority: faker.helpers.arrayElement(priorities),

    assignee: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
    },

    annotationCount: faker.number.int({
      min: 0,
      max: 300,
    }),

    meta: {
      source: faker.company.name(),
    },
  }));

  await Task.insertMany(tasks);

  console.log("🎉 Seeded", tasks.length, "tasks");

  process.exit();
}

seed();
