import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const extract = async () => {
    await API.post("/extract", { text });
    setText("");
    fetchTasks();
  };

  const complete = async (id) => {
    await API.put(`/tasks/${id}/complete`);
    fetchTasks();
  };

  const remove = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand">TaskScribe Dashboard</span>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </nav>

      <div className="container mt-4">

        {/* Extract Section */}
        <div className="card p-4 mb-4">
          <h5 className="mb-3">Paste Meeting Transcript</h5>

          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="e.g. Rohit needs to fix login bug before 12 Feb..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button className="btn btn-primary" onClick={extract}>
            Extract Tasks
          </button>
        </div>

        {/* Task List */}
        <h5 className="mb-3">Your Tasks</h5>

        {tasks.length === 0 && (
          <div className="alert alert-secondary">
            No tasks yet. Paste a meeting transcript to generate tasks.
          </div>
        )}

        {tasks.map((t) => (
          <div className="card p-3 mb-3" key={t.id}>
            <div className="task-title">{t.description}</div>

            <div className="task-meta mt-2">
              Owner: <b>{t.owner || "—"}</b> |
              Deadline: <b> {t.deadline || "—"}</b> |
              Priority: <b> {t.priority}</b>
            </div>

            <div className="mt-3 d-flex gap-2">
              {!t.completed && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => complete(t.id)}
                >
                  Mark Complete
                </button>
              )}

              <button
                className="btn btn-danger btn-sm"
                onClick={() => remove(t.id)}
              >
                Delete
              </button>
            </div>

            {t.completed && (
              <div className="completed-label mt-2">✔ Completed</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
