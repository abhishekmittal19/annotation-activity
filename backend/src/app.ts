import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes";
import annotationRoutes from "./routes/annotation.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://main.d2tuvgl9iw3svz.amplifyapp.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", annotationRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

export default app;
