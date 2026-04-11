const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Student Task Manager API is running.",
    database: mongoose.connection.readyState === 1 ? "connected" : "memory-mode",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI not provided. Starting with in-memory data mode.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to in-memory mode.");
    console.error(error.message);
  }
};

connectDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
