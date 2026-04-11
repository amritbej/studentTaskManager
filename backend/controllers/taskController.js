const Task = require("../models/task");
const mongoose = require("mongoose");
const store = require("../data/store");

const normalizeTask = (task) => ({
  ...task,
  _id: task._id.toString(),
  user: task.user?.toString?.() || task.user,
});

exports.addTask = async (req, res) => {
  try {
    const { title, subject, dueDate, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const payload = {
      user: req.user.id,
      title: title.trim(),
      subject: subject?.trim() || "",
      dueDate: dueDate || null,
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    };

    const task = store.isDatabaseConnected()
      ? await Task.create(payload)
      : await store.tasks.create(payload);

    return res.status(201).json(normalizeTask(task.toObject ? task.toObject() : task));
  } catch (err) {
    return res.status(500).json({ message: "Unable to add task.", error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = store.isDatabaseConnected()
      ? await Task.find({ user: req.user.id }).sort({ completed: 1, createdAt: -1 }).lean()
      : await store.tasks.listByUser(req.user.id);

    return res.json(tasks.map(normalizeTask));
  } catch (err) {
    return res.status(500).json({ message: "Unable to fetch tasks.", error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (store.isDatabaseConnected() && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const updates = {};

    if (typeof req.body.title === "string" && req.body.title.trim()) {
      updates.title = req.body.title.trim();
    }
    if (typeof req.body.subject === "string") {
      updates.subject = req.body.subject.trim();
    }
    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }
    if (typeof req.body.priority === "string" && ["low", "medium", "high"].includes(req.body.priority)) {
      updates.priority = req.body.priority;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "dueDate")) {
      updates.dueDate = req.body.dueDate || null;
    }

    const updatedTask = store.isDatabaseConnected()
      ? await Task.findOneAndUpdate(
          { _id: req.params.id, user: req.user.id },
          updates,
          { new: true }
        ).lean()
      : await store.tasks.update(req.user.id, req.params.id, updates);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json(normalizeTask(updatedTask));
  } catch (err) {
    return res.status(500).json({ message: "Unable to update task.", error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (store.isDatabaseConnected() && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const deleted = store.isDatabaseConnected()
      ? await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id }).lean()
      : await store.tasks.remove(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.json({ message: "Task deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Unable to delete task.", error: err.message });
  }
};
