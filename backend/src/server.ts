import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app";

import { connectDB } from "./config/database";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀Server running on port ${PORT}`);
  });
};

startServer();
