import { useEffect, useState } from "react";
import axios from "axios";
import './responsive.css';
const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    e.preventDefault();
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://shiftmate-back.onrender.com/api/auth/login",
        form
      );

      const { token, role } = res.data;

      if (!token) {
        alert("Login failed: No token received");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      alert("login successful");

      if (role === "manager") {
        window.location.href = "/manager/dashboard";
      } else {
        window.location.href = "/employee/dashboard";
      }
    } catch (err) {
      alert("login Failed");
    }
  };

  return (
    <div className="form-con">
      <div className="home-link"><a href="https://shiftmate-five.vercel.app/home">Dashboard</a></div>
      <div className="form-login">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <div className="inner-con">
            <label>
              <input type="checkbox" />
              Remember Me
            </label>
            <p>Forgot Password?</p>
          </div>

       <div className="login-btn">
       <button type="submit" className="login-btn">
            Login
          </button>
       </div>

          <p>Don't have an account? <a href="https://shiftmate-five.vercel.app/register">Register</a></p>
          
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
