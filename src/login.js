import { useEffect, useState } from "react";
import axios from "axios";

const LoginForm = () => {
    const [form, setForm] = useState({email:'', password:""})

    const handleChange = (e) => {
    e.preventDeafault();
    setForm({...form, [e.target.name]:e.target.value })

    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post('/api/auth/login', form);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.role);
          alert('login successful');

          if (res.data.role === 'manager') {
            window.location.href = '/manager/dashboard';
          } else {
            window.location.href = '/employee/dashboard';
          }

        } catch (err) {
          alert('login Failed' + err.response.data.error);
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        
          <button type="submit">Register</button>
        </form>
      );
    };
    
    export default LoginForm;
    
