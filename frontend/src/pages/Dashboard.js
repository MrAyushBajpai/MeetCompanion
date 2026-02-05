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
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button className="btn btn-primary" onClick={extract}>
            Extract Tasks
          </button>
        </div>

        <h5>Your Tasks</h5>

        <div className="task-filters card p-3 mb-3">
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

        {getSortedFilteredTasks().map((t) => (
          <div className="card p-3 mb-3" key={t.id}>
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
                <div className="task-title">{t.description}</div>

                <div className="task-meta mt-2">
                  Owner: <b>{t.owner || "—"}</b> | Deadline:{" "}
                  <b>{t.deadline || "—"}</b> | Priority: <b>{t.priority}</b> |
                  Created: <b>{formatTimestamp(t.created_at)}</b>
                </div>

                {/* BUTTON ROW — NEVER CHANGES POSITION */}
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {t.completed ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => reopen(t.id)}
                    >
                      Reopen Task
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
                    className="btn btn-warning btn-sm"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
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
    </>
  );
}
