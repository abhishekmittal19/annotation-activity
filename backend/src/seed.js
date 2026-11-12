"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const faker_1 = require("@faker-js/faker");
const mongoose_1 = __importDefault(require("mongoose"));
const task_model_1 = __importDefault(require("./models/task.model"));
const MONGO_URI = process.env.MONGO_URI;
const statuses = ["pending", "assigned", "in_progress", "completed"];
const priorities = ["low", "medium", "high"];
const types = ["image", "text", "audio", "video"];
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log("✅ Connected");
    await task_model_1.default.deleteMany();
    const tasks = Array.from({ length: 100 }).map(() => ({
        title: faker_1.faker.helpers.arrayElement([
            "Annotate MRI Scan",
            "Label Traffic Images",
            "Review OCR Document",
            "Video Bounding Box",
            "Speech Annotation",
            "Sentiment Analysis",
        ]),
        type: faker_1.faker.helpers.arrayElement(types),
        status: faker_1.faker.helpers.arrayElement(statuses),
        priority: faker_1.faker.helpers.arrayElement(priorities),
        assignee: {
            id: faker_1.faker.string.uuid(),
            name: faker_1.faker.person.fullName(),
        },
        annotationCount: faker_1.faker.number.int({
            min: 0,
            max: 300,
        }),
        meta: {
            source: faker_1.faker.company.name(),
            imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1200&q=80",
        },
    }));
    await task_model_1.default.insertMany(tasks);
    console.log("🎉 Seeded", tasks.length, "tasks");
    process.exit();
}
seed();
