import { useEffect, useState } from "react";
import axios from "axios";
import AuthPage from "./pages/signup";
import DashboardPage from "./pages/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_STORAGE_KEY = "student-task-manager-token";
const USER_STORAGE_KEY = "student-task-manager-user";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  const persistSession = (sessionToken, sessionUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken("");
    setUser(null);
    setTasks([]);
    setTaskMessage("");
  };

  const extractError = (error, fallbackMessage) =>
    error?.response?.data?.message || fallbackMessage;

  const loadTasks = async () => {
    if (!token) {
      return;
    }

    setIsLoadingTasks(true);
    try {
      const response = await client.get("/tasks");
      setTasks(response.data);
      setTaskMessage("");
    } catch (error) {
      const message = extractError(error, "Unable to load tasks.");
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        clearSession();
      }
      setTaskMessage(message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [token]);

  const handleAuthSubmit = async ({ mode, formData }) => {
    const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";

    try {
      const response = await client.post(endpoint, formData);
      persistSession(response.data.token, response.data.user);
      setAuthMessage(mode === "login" ? "Welcome back." : "Account created successfully.");
      return { success: true };
    } catch (error) {
      const message = extractError(error, `Unable to ${mode}.`);
      setAuthMessage(message);
      return { success: false, message };
    }
  };

  const handleCreateTask = async (taskPayload) => {
    try {
      const response = await client.post("/tasks", taskPayload);
      setTasks((currentTasks) => [response.data, ...currentTasks]);
      setTaskMessage("Task added.");
      return { success: true };
    } catch (error) {
      const message = extractError(error, "Unable to create task.");
      setTaskMessage(message);
      return { success: false, message };
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await client.put(`/tasks/${taskId}`, updates);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === taskId ? response.data : task))
      );
      setTaskMessage("Task updated.");
      return { success: true };
    } catch (error) {
      const message = extractError(error, "Unable to update task.");
      setTaskMessage(message);
      return { success: false, message };
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await client.delete(`/tasks/${taskId}`);
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
      setTaskMessage("Task deleted.");
      return { success: true };
    } catch (error) {
      const message = extractError(error, "Unable to delete task.");
      setTaskMessage(message);
      return { success: false, message };
    }
  };

  if (!token || !user) {
    return (
      <AuthPage
        message={authMessage}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <DashboardPage
      isLoading={isLoadingTasks}
      message={taskMessage}
      onCreateTask={handleCreateTask}
      onDeleteTask={handleDeleteTask}
      onLogout={clearSession}
      onRefresh={loadTasks}
      onUpdateTask={handleUpdateTask}
      tasks={tasks}
      user={user}
    />
  );
}

export default App;
