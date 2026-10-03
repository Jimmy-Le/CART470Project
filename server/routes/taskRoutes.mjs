import express from "express";
import Task from "../models/Task.mjs";

const router = express.Router();

// GET /api/tasks
router.get("/", async (request, response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    response.json(tasks);
  } catch (error) {
    response.status(500).json({ error: "Could not load tasks" });
  }
});

// POST /api/tasks
router.post("/", async (request, response) => {
  try {
    const { text } = request.body;

    if (!text || text.trim() === "") {
      return response.status(400).json({
        error: "Task text is required"
      });
    }

    const task = await Task.create({ text });
    response.status(201).json(task);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

export default router;