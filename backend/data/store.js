const mongoose = require("mongoose");

const users = [];
const tasks = [];

const clone = (value) => JSON.parse(JSON.stringify(value));

const createId = () => new mongoose.Types.ObjectId().toString();

exports.isDatabaseConnected = () => mongoose.connection.readyState === 1;

exports.users = {
  async findByEmail(email) {
    return users.find((user) => user.email === email.toLowerCase()) || null;
  },

  async create({ name, email, password }) {
    const newUser = {
      _id: createId(),
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    return clone(newUser);
  },
};

exports.tasks = {
  async create({ user, title, subject, dueDate, priority }) {
    const task = {
      _id: createId(),
      user,
      title,
      subject: subject || "",
      dueDate: dueDate || null,
      priority: priority || "medium",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(task);
    return clone(task);
  },

  async listByUser(userId) {
    return clone(
      tasks
        .filter((task) => task.user === userId)
        .sort((first, second) => {
          if (!first.completed && second.completed) {
            return -1;
          }
          if (first.completed && !second.completed) {
            return 1;
          }
          return new Date(first.createdAt) < new Date(second.createdAt) ? 1 : -1;
        })
    );
  },

  async update(userId, taskId, updates) {
    const taskIndex = tasks.findIndex(
      (task) => task._id === taskId && task.user === userId
    );

    if (taskIndex === -1) {
      return null;
    }

    const nextTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = nextTask;
    return clone(nextTask);
  },

  async remove(userId, taskId) {
    const taskIndex = tasks.findIndex(
      (task) => task._id === taskId && task.user === userId
    );

    if (taskIndex === -1) {
      return false;
    }

    tasks.splice(taskIndex, 1);
    return true;
  },
};
