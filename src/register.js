import { useEffect, useState } from "react";
import axios from "axios";

const RegisterForm = () => {
    const [form, setForm] = useState({

        name: '',
        email: "",
        password: "",
        role:"employee"
    })

    const handleChange = (e) => {
    e.preventDeafault();
    setForm({...form, [e.target.name]:e.target.value })

    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post('/api/auth/register', form);
          alert('Registration successful');
        } catch (err) {
          alert('Error: ' + err.response.data.error);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <select name="role" onChange={handleChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit">Register</button>
        </form>
      );
    };
    
    export default RegisterForm;
    
