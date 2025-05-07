import { useEffect, useState } from "react";
import axios from "axios";
import './responsive.css';

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const handleChange = (e) => {
    e.preventDefault();
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://shiftmate-back.onrender.com/api/auth/register",
        form
      );
      alert("Registration successful");
      window.location.href = "/login";
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message || "An error occurred"));

    }
  };

  return (
    <div className="registe-con">
       <div className="home-link"><a href="https://shiftmate-five.vercel.app/home">Dashboard</a></div>
      <div className="register-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />
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
          <select name="role" onChange={handleChange}>
            <option value="employee"style={{ color: '#000' }}
 >Employee</option>
            <option value="manager" style={{ color: '#000' }}
            >Manager</option>
          </select>

          <div className="register-btn">
            <button type="submit">Register</button>
          </div>
          <p>Already registered? <a href="https://shiftmate-five.vercel.app/login">Login</a></p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
