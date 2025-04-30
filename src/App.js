import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminAttendanceForm from './manger';
import EmployeeAttandece from './employee';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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
