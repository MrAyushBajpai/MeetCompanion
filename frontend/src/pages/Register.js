import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [data, setData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const register = async () => {
    await API.post("/users/register", data);
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Register</h3>

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

        <button className="btn btn-primary w-100" onClick={register}>
          Register
        </button>

        <p className="text-center mt-3">
          Already have account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
