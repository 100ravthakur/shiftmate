import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminAttendance = () => {
  const [userid, setUserId] = useState("");
  const [selectEmployee, setSelectEmployee] = useState(null);
  const [selectdate, setselectdate] = useState("");
  const [selectday, setselectday] = useState([]);
  const [searchQuery, setsearchQuery] = useState("");
  const [employees, setemployees] = useState([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const currnetdate = new Date();
    const day = generateDaysForMonth(
      currnetdate.getFullYear(),
      currnetdate.getMonth()
    );
    setselectday(day);
  }, []);

  const generateDaysForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    return daysArray;
  };

  const handleSerach = async () => {
    setloading(true);

    try {
      const response = await axios.get(
        `/api/users/search?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setemployees(response.data);
    } catch (error) {
      alert("Error searching for employees");
    } finally {
      setloading(false);
    }
  };

  const handleSelectEm = (employee) => {
    setSelectEmployee(employee);
    setUserId(employee.userId);
  };

  const handleDateClick = (day) => {
    if (!day || isNaN(day)) {
        alert("Invalid day selected");
        return;
      }
    const selected = new Date();
    selected.setDate(day);
    setselectdate(selected.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectEmployee || !selectdate) {
      alert("Please select an employee and a date");
      return;
    }
    const body = {
      userid,
      date: selectdate,
    };

    try {
        await axios.post('/api/attendance/mark', body, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert('Attendance marked successfully');
      } catch (error) {
        alert('Error marking attendance');
      };

  };
  return (

  <>
  
  <h2>Mark Attendance (Admin)</h2>

  <input
        type="text"
        placeholder="Search by Name or User ID"
        value={searchQuery}
        onChange={(e) => setsearchQuery(e.target.value)}
      />
      <button onClick={handleSerach}>Search</button>
      {loading && <p>Loading employees...</p>}
      <div>
        {employees.length > 0 ? (
          <ul>
            {employees.map((employee) => (
              <li key={employee.userId} onClick={() => handleSelectEm(employee)}>
                {employee.name} ({employee.userId})
              </li>
            ))}
          </ul>
        ) : (
          searchQuery && <p>No employees found for "{searchQuery}"</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <h3>Selected Employee: {selectEmployee?.name || 'None selected'}</h3>
        <div>
          <h3>Select a Date to Mark Attendance</h3>
          <div className="calendar">
            {selectday.map((day) => (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                style={{
                  backgroundColor: selectdate?.endsWith(day) ? 'green' : 'transparent',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={!selectEmployee || !selectdate}>
          Mark Attendance
        </button>
      </form>
      {!selectEmployee && !loading && <p>Please select an employee to mark attendance.</p>}


  </>
  )
};

export default AdminAttendance;