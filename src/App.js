import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './login';
import Register from './register';
import AdminAttendanceForm from './manger';
import EmployeeAttandece from './employee';
import Home from './home';
import Header from './header';
import './responsive.css';

function App() {
  return (
    <div className="App">
        
      <Router>
      <Header />
        <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manager/dashboard" element={<AdminAttendanceForm />} />
          <Route path="/employee/dashboard" element={<EmployeeAttandece />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
