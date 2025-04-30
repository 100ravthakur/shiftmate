import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeAttandece = () => {
  const [today, setTodays] = useState(new Date().getDate());
  const [selectdate, setselectdate] = useState(null);
  const [daysInMonth, setdaysInMonth] = useState([]);
  const [shomModal, setShowModal] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState("");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const dayArray = Array.from({ length: days }, (_, i) => i + 1);
    setdaysInMonth(dayArray);
  }, []);

  const handleDateClick = (day) => {
    const now = new Date();
    const selected = new Date(now.getFullYear(), now.getMonth(), day);

    setselectdate(selected);

    if (day === today) {
      setShowModal(true);
    } else {
      alert("You can only mark attendance for today's date.");
    }
  };

  const handleMarkAttendance = async () => {
    if (!selfie || !location) {
      alert("Missing selfie, location, or date");
      return;
    }

    const formData = new FormData();
    formData.append("selfie", selfie);
    formData.append("location", location);

    try {
        
        const res = await axios.post('/api/attendance/mark',formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          });
          alert("Attendance marked successfully!");

          setAttendance((prev) => ({
            ...prev,
            [selectdate]: {
              status: "present",
              imageUrl: res.data.imageUrl,
              location: res.data.location,
            },
            
          }));
          setShowModal(false);
       
    } catch (error) {
        console.error(error);
    alert("Failed to mark attendance");
        
    }

    alert("Attendance submitted!");
    setShowModal(false);
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setLocation(
            data.display_name || `Lat: ${latitude}, Lon: ${longitude}`
          );
        } catch (error) {
          alert("Error fetching address");
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Attendance Calendar</h2>
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border 
                  ${day === today ? "bg-blue-200" : "bg-gray-100"} 
                  hover:bg-blue-100`}
            >
              {day}
            </button>
          ))}
        </div>

        {shomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h3 className="text-lg font-bold mb-4">Mark Attendance</h3>

              <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block mb-2 font-medium">Upload Selfie:</label>
        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={(e) => setSelfie(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={fetchLocation}
          className="mb-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Get Live Location
        </button>

        {location && (
          <p className="text-sm text-gray-700 mb-4">📍 {location}</p>
        )}

        <button
          className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          onClick={handleMarkAttendance}
          disabled={!selfie || !location}
        >
          Submit Attendance
        </button>
      </div>
    </>
  );
};

export default EmployeeAttandece;
