import { useMemo, useState } from "react";

const defaultTaskForm = {
  title: "",
  subject: "",
  dueDate: "",
  priority: "medium",
};

const priorityStyles = {
  low: "bg-emerald-400/15 text-emerald-200",
  medium: "bg-amber-400/15 text-amber-200",
  high: "bg-rose-400/15 text-rose-200",
};

function DashboardPage({
  isLoading,
  message,
  onCreateTask,
  onDeleteTask,
  onLogout,
  onRefresh,
  onUpdateTask,
  tasks,
  user,
}) {
  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState("");
  const [isSavingTask, setIsSavingTask] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && !task.completed) ||
        (statusFilter === "done" && task.completed);

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesStatus && matchesPriority;
    });
  }, [priorityFilter, statusFilter, tasks]);

  const summary = useMemo(() => {
    const completedCount = tasks.filter((task) => task.completed).length;
    const pendingCount = tasks.length - completedCount;
    const dueSoonCount = tasks.filter((task) => {
      if (!task.dueDate || task.completed) {
        return false;
      }

      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      return dueDate >= today && dueDate <= threeDaysFromNow;
    }).length;

    return {
      total: tasks.length,
      pending: pendingCount,
      completed: completedCount,
      dueSoon: dueSoonCount,
    };
  }, [tasks]);

  const resetForm = () => {
    setTaskForm(defaultTaskForm);
    setEditingTaskId("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmitTask = async (event) => {
    event.preventDefault();
    setIsSavingTask(true);

    const result = editingTaskId
      ? await onUpdateTask(editingTaskId, taskForm)
      : await onCreateTask(taskForm);

    if (result.success) {
      resetForm();
    }

    setIsSavingTask(false);
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      subject: task.subject || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      priority: task.priority || "medium",
    });
  };

  const handleToggleTask = async (task) => {
    await onUpdateTask(task._id, {
      completed: !task.completed,
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "No due date";
    }

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  };

  return (
    <main className="min-h-screen bg-app-base text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/20 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome back, {user.name}</h1>
            <p className="mt-2 text-slate-300">
              Keep classes, assignments, and deadlines moving without the clutter.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
              onClick={onRefresh}
              type="button"
            >
              Refresh
            </button>
            <button
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              onClick={onLogout}
              type="button"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total tasks", value: summary.total },
            { label: "Pending", value: summary.pending },
            { label: "Completed", value: summary.completed },
            { label: "Due soon", value: summary.dueSoon },
          ].map((item) => (
            <article
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5"
              key={item.label}
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-cyan-200">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6">
            <h2 className="text-2xl font-semibold">
              {editingTaskId ? "Edit task" : "Add a task"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Capture homework, revisions, project checkpoints, and lab work.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmitTask}
            >
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Task title</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300"
                  name="title"
                  onChange={handleFormChange}
                  placeholder="Finish physics assignment"
                  required
                  value={taskForm.title}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Subject</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300"
                  name="subject"
                  onChange={handleFormChange}
                  placeholder="Physics"
                  value={taskForm.subject}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Due date</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300"
                    name="dueDate"
                    onChange={handleFormChange}
                    type="date"
                    value={taskForm.dueDate}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Priority</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300"
                    name="priority"
                    onChange={handleFormChange}
                    value={taskForm.priority}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSavingTask}
                  type="submit"
                >
                  {isSavingTask
                    ? "Saving..."
                    : editingTaskId
                      ? "Update task"
                      : "Add task"}
                </button>

                {editingTaskId ? (
                  <button
                    className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:border-rose-300 hover:text-rose-200"
                    onClick={resetForm}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Your tasks</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Filter work by status and priority to stay focused.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-cyan-300"
                  onChange={(event) => setStatusFilter(event.target.value)}
                  value={statusFilter}
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open only</option>
                  <option value="done">Completed only</option>
                </select>

                <select
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-cyan-300"
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  value={priorityFilter}
                >
                  <option value="all">All priorities</option>
                  <option value="high">High priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="low">Low priority</option>
                </select>
              </div>
            </div>

            {message ? (
              <p className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {message}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <article className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-300">
                  Loading tasks...
                </article>
              ) : null}

              {!isLoading && filteredTasks.length === 0 ? (
                <article className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-300">
                  No tasks match this view yet. Add one from the left panel to get started.
                </article>
              ) : null}

              {!isLoading
                ? filteredTasks.map((task) => (
                    <article
                      className="flex flex-col gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 lg:flex-row lg:items-center lg:justify-between"
                      key={task._id}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                          className={`mt-1 h-6 w-6 rounded-full border transition ${
                            task.completed
                              ? "border-emerald-300 bg-emerald-300"
                              : "border-white/20 bg-transparent"
                          }`}
                          onClick={() => handleToggleTask(task)}
                          type="button"
                        />

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3
                              className={`text-lg font-semibold ${
                                task.completed ? "text-slate-400 line-through" : "text-slate-100"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                priorityStyles[task.priority] || priorityStyles.medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                            <span>{task.subject || "General"}</span>
                            <span>{formatDate(task.dueDate)}</span>
                            <span>{task.completed ? "Completed" : "In progress"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
                          onClick={() => startEditingTask(task)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-200 transition hover:border-rose-300"
                          onClick={() => onDeleteTask(task._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
