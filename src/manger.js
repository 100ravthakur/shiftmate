import React, { useState, useEffect } from "react";
import axios from "axios";

import './responsive.css';
const downloadAttendanceAsCSV = (attendanceArray) => {

  const header = ["Date", "Status", "Selfie URL", "Latitude", "Longitude"];
  const rows = attendanceArray.map((entry) => [
    new Date(entry.date).toLocaleDateString("en-CA"),
    entry.status,
    entry.selfieUrl || "",
    entry.location?.latitude || "",
    entry.location?.longitude || "",
  ]);

  const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
  URL.revokeObjectURL(url);
};



const AdminAttendance = () => {
  const [attendanceArray, setAttendanceArray] = useState([]);
  const [selectEmployee, setSelectEmployee] = useState(null);
  const [selectDay, setSelectDay] = useState([]); // Days in the current month
  const [attendance, setAttendance] = useState({}); // Store marked attendance
  const [searchQuery, setSearchQuery] = useState(""); // Search query for employees
  const [employees, setEmployees] = useState([]); // Employee list
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [currentDayAttendance, setCurrentDayAttendance] = useState(null);


  useEffect(() => {
    // Load current month's days
    const currentDate = new Date();
    const days = generateDaysForMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setSelectDay(days);
  }, []);

  const generateDaysForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/search?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error searching for employees:", error); // Debug error
      alert("Error searching for employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectEmployee(employee);
    fetchEmployeeAttendance(employee._id); // Fetch attendance data for the selected employee
  };

  const fetchEmployeeAttendance = async (userId) => {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/users/view?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch attendance");
      }

      const data = await res.json();
      console.log("Full attendance data:", data);

      const { attendance, user } = data;

      const attendanceData = attendance.reduce((acc, record) => {
        const date = new Date(record.date).toLocaleDateString("en-CA");
        acc[date] = record.status;
        return acc;
      }, {});

      setAttendance(attendanceData);
      setAttendanceArray(attendance);
      setEmployeeProfile(user);

      const currentDate = new Date().toLocaleDateString("en-CA");
      const currentAttendance = attendance.find(
        (record) =>
          new Date(record.date).toLocaleDateString("en-CA") === currentDate
      );
      console.log(currentAttendance);

      if (currentAttendance) {
        // Fetch additional details like selfie and location for current day attendance
        const { selfie, location, status } = currentAttendance;

        setCurrentDayAttendance({
          status: currentAttendance.status,
          selfieUrl: currentAttendance.selfieUrl,
          location: currentAttendance.location,
        });
      } else {
        setCurrentDayAttendance(null);
        // No attendance for today
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      alert(error.message || "Error fetching attendance");
    }
  };
  useEffect(() => {
    // Assuming currentDayAttendance has a location object with latitude and longitude
    if (currentDayAttendance && currentDayAttendance.location) {
      const { latitude, longitude } = currentDayAttendance.location;
      fetchAddress(latitude, longitude);
    }
    console.log("Current Day Attendance: ", currentDayAttendance);
  }, [currentDayAttendance]);

  // Function to fetch the address from OpenStreetMap Nominatim API
  const fetchAddress = async (latitude, longitude) => {
    setLoadingAddress(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name); // Set the address from Nominatim API
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Error fetching address");
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div>
      <div className="manager-con">
        <div className="user-info">
          <h2>Employee Attendance</h2>

          <input
            type="text"
            placeholder="Search by Name or User ID"
            value={searchQuery}
            className="search-emp"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          {loading && <p>Loading employees...</p>}

          <div>
            {Array.isArray(employees) && employees.length > 0 ? (
              <ul>
                {employees.map((employee) => (
                  <li
                    key={employee._id}
                    onClick={() => handleSelectEmployee(employee)} // Handle employee selection
                  >
                    {employee.name} ({employee.email})
                  </li>
                ))}
              </ul>
            ) : (
              searchQuery && <p>No employees found for "{searchQuery}"</p>
            )}
          </div>

          {selectEmployee && (
            <>
              <h3>Attendance Calendar for {selectEmployee.name}</h3>
              <div className="calendar">
                {selectDay.map((day) => {
                  // Format the selected day to 'YYYY-MM-DD' (ISO format)
                  const dateString = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    day
                  ).toLocaleDateString("en-CA");

                  let buttonStyle = {}; // Default style

                  // Check the attendance status for each date
                  if (attendance[dateString] === "present") {
                    buttonStyle = { backgroundColor: "green", color: "white" }; // Green for Present
                  } else if (attendance[dateString] === "absent") {
                    buttonStyle = { backgroundColor: "red", color: "white" }; // Red for Absent
                  } else if (attendance[dateString] === "remote") {
                    buttonStyle = { backgroundColor: "yellow", color: "black" }; // Yellow for Leave
                  }

                  return (
                    <button
                      key={day} // This key is necessary for React to track each element uniquely
                      style={buttonStyle}
                      title={`Attendance on ${day}: ${
                        attendance[dateString] || "Not marked"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="employee">
          <div className="userattendance-detail">
            <div className="attend-detail">
              <h2>Today's Attendance Details</h2>
              {attendanceArray.length > 0 && (
                <button
                  onClick={() => downloadAttendanceAsCSV(attendanceArray)}
                  className="download-csv-btn"
                >
                  Download Attendance as CSV
                </button>
              )}
            </div>

            {currentDayAttendance && (
              <div className="current-day-attendance">
                <div className="details">
                  <h4>Status</h4>
                  <p> {currentDayAttendance.status || "Not marked"}</p>
                </div>
                {/* Displaying the Selfie */}
                {currentDayAttendance && currentDayAttendance.selfieUrl && (
                  <div className="details">
                    <h4>Selfie</h4>
                    {console.log(
                      "Selfie URL:",
                      currentDayAttendance.selfieUrl
                    )}{" "}
                    {/* Log the selfie URL */}
                    <img
                      src={currentDayAttendance.selfieUrl}
                      alt="Selfie"
                      onError={() => console.log("Error loading image")}
                    />
                  </div>
                )}

                {/* Displaying Location if available */}
                {currentDayAttendance.location && (
                  <div className="details">
                    <h4>Location</h4>
                    {loadingAddress ? (
                      <p>Loading address...</p>
                    ) : (
                      <p>{address || "Address not available"}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>Employee information</h2>

            {employeeProfile && (
              <div className="employee-profile">
                <h3>Profile of {employeeProfile.name}</h3>
                <p>Email: {employeeProfile.email}</p>
                <p>User ID: {employeeProfile._id}</p>
                <p>Role: {employeeProfile.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
