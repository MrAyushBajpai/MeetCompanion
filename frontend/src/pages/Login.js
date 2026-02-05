import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const login = async () => {
    const res = await API.post("/users/login", data);
    localStorage.setItem("token", res.data.access_token);
    navigate("/dashboard");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-4">TaskScribe Login</h3>

        <input
          className="form-control mb-3"
          placeholder="Username"
          onChange={(e) => setData({ ...data, username: e.target.value })}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <button className="btn btn-primary w-100" onClick={login}>
          Login
        </button>

        <p className="text-center mt-3">
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
