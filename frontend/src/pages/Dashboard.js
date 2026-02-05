import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const formatTimestamp = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const getSortedFilteredTasks = () => {
    const filtered = tasks.filter((task) => {
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "completed" && task.completed) ||
        (statusFilter === "open" && !task.completed);

      const priorityMatch =
        priorityFilter === "all" || task.priority === priorityFilter;

      return statusMatch && priorityMatch;
    });

    return filtered.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
        return bTime - aTime;
      }

      return b.id - a.id;
    });
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

  const reopen = async (id) => {
    await API.put(`/tasks/${id}/undo`);
    fetchTasks();
  };

  const remove = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditing(task.id);
    setEditData(task);
  };

  const saveEdit = async (id) => {
    await API.put(`/tasks/${id}`, editData);
    setEditing(null);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg dashboard-nav">
        <div className="container">
          <div className="nav-brand">
            <span className="brand-mark" />
            <div>
              <span className="navbar-brand">TaskScribe</span>
              <span className="nav-subtitle">Dashboard</span>
            </div>
          </div>

          <div className="nav-actions">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-shell">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>Your Workspace</h1>
              <p className="text-muted">
                Capture decisions, track ownership, and keep momentum.
              </p>
            </div>
          </div>

          {/* Extract Section */}
          <div className="glass-card p-4 mb-4">
            <div className="section-title">
              <h5>Paste Meeting Transcript</h5>
              <span>Auto-detect action items in seconds.</span>
            </div>

            <textarea
              className="form-control mb-3"
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the meeting notes or transcript here..."
            />

            <button className="btn btn-primary" onClick={extract}>
              Extract Tasks
            </button>
          </div>

          <div className="task-toolbar">
            <div>
              <h5>Your Tasks</h5>
              <p className="text-muted mb-0">Newest tasks appear first.</p>
            </div>

            <div className="task-filters glass-card p-3">
              <div className="filter-group">
                <span className="filter-label">Status</span>
                <div className="btn-group" role="group" aria-label="Status filter">
                  <button
                    className={`btn btn-sm ${
                      statusFilter === "all" ? "btn-primary" : "btn-outline-light"
                    }`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn btn-sm ${
                      statusFilter === "open" ? "btn-primary" : "btn-outline-light"
                    }`}
                    onClick={() => setStatusFilter("open")}
                  >
                    Open
                  </button>
                  <button
                    className={`btn btn-sm ${
                      statusFilter === "completed"
                        ? "btn-primary"
                        : "btn-outline-light"
                    }`}
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="priorityFilter">
                  Priority
                </label>
                <select
                  id="priorityFilter"
                  className="form-control form-control-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

        {getSortedFilteredTasks().map((t) => (
          <div className="glass-card task-card p-3 mb-3" key={t.id}>
            {editing === t.id ? (
              <>
                <input
                  className="form-control mb-2"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Owner"
                  value={editData.owner || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, owner: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Deadline"
                  value={editData.deadline || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, deadline: e.target.value })
                  }
                />

                <select
                  className="form-control mb-2"
                  value={editData.priority}
                  onChange={(e) =>
                    setEditData({ ...editData, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={() => saveEdit(t.id)}
                >
                  Save
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="task-header">
                  <div className="task-title">{t.description}</div>
                  <span className={`status-pill ${t.completed ? "done" : "open"}`}>
                    {t.completed ? "Completed" : "Open"}
                  </span>
                </div>

                <div className="task-meta mt-2">
                  <span>
                    Owner: <b>{t.owner || "—"}</b>
                  </span>
                  <span>
                    Deadline: <b>{t.deadline || "—"}</b>
                  </span>
                  <span>
                    Priority: <b>{t.priority}</b>
                  </span>
                  <span>
                    Created: <b>{formatTimestamp(t.created_at)}</b>
                  </span>
                </div>

                {/* BUTTON ROW — NEVER CHANGES POSITION */}
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {t.completed ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => reopen(t.id)}
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => complete(t.id)}
                    >
                      Complete
                    </button>
                  )}

                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => remove(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        </div>
      </div>
    </>
  );
}
