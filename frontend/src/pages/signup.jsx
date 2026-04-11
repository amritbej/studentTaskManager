import { useState } from "react";

const defaultFormState = {
  name: "",
  email: "",
  password: "",
};

function AuthPage({ message, onSubmit }) {
  const [mode, setMode] = useState("signup");
  const [formData, setFormData] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setFormData(defaultFormState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload =
      mode === "signup"
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          };

    const result = await onSubmit({ mode, formData: payload });

    if (result.success) {
      setFormData(defaultFormState);
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-app-base text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-sky-950/25 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
              Student Task Manager
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Organize assignments, deadlines, and progress in one clean workspace.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Create your account, track study tasks, and stay on top of submissions without
              juggling notes and reminders across apps.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Track every task", value: "Create, edit, complete, and delete work fast." },
                { label: "Prioritize smartly", value: "Use deadlines and priorities to focus on what matters." },
                { label: "Stay consistent", value: "See your workload clearly before it piles up." },
              ].map((item) => (
                <article
                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                  key={item.label}
                >
                  <p className="text-sm font-semibold text-cyan-200">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-sky-950/25">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <button
                className={`rounded-full px-5 py-2 transition ${
                  mode === "signup" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                }`}
                onClick={() => handleModeChange("signup")}
                type="button"
              >
                Sign up
              </button>
              <button
                className={`rounded-full px-5 py-2 transition ${
                  mode === "login" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                }`}
                onClick={() => handleModeChange("login")}
                type="button"
              >
                Log in
              </button>
            </div>

            <h2 className="mt-6 text-3xl font-semibold">
              {mode === "signup" ? "Create your workspace" : "Log back into your account"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {mode === "signup"
                ? "Start managing tasks in under a minute."
                : "Pick up right where you left off."}
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Full name</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
                    name="name"
                    onChange={handleChange}
                    placeholder="Alex Johnson"
                    required
                    value={formData.name}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email address</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
                  name="email"
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
                  minLength={6}
                  name="password"
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  type="password"
                  value={formData.password}
                />
              </label>

              {message ? (
                <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                  {message}
                </p>
              ) : null}

              <button
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Create account"
                    : "Log in"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
