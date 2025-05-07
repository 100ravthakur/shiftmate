import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import Webcam from "react-webcam";

import "./responsive.css";

const EmployeeAttendance = () => {
  const [today] = useState(new Date().getDate());
  const [selectdate, setSelectDate] = useState(null);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [selfie, setSelfie] = useState(null);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: "",
  });
  const [status, setStatus] = useState("");
  const [attendance, setAttendance] = useState({});
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [attendanceDetails, setAttendanceDetails] = useState(null);

  const webcamRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, []);

  const handleDateClick = (day) => {
    const now = new Date();
    const selected = new Date(now.getFullYear(), now.getMonth(), day);
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toLocaleDateString("en-CA");
    const selectedDate = selected.toLocaleDateString("en-CA");

    if (selectedDate === todayDate) {
      // Check if attendance is already marked for this date
      const formattedDate = selected.toLocaleDateString("en-CA");
      if (attendance[formattedDate]) {
        alert("Attendance for this date has already been marked.");
      } else {
        setSelectDate(selected);
        setShowCamera(true); // Show the camera if not marked
        fetchLocation(); // Fetch the location
      }
    } else {
      alert("You can only mark attendance for today's date.");
    }
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const file = dataURLtoFile(imageSrc, "selfie.jpg");
        setSelfie(file);
        setShowCamera(false);
      } else {
        alert("Unable to capture image. Please check your camera.");
      }
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleMarkAttendance = async () => {
    if (
      !selfie ||
      !selectdate ||
      !status ||
      location.latitude === null ||
      location.longitude === null
    ) {
      alert("Missing selfie, location, or status. Please provide all details.");
      return;
    }

    const formData = new FormData();
    formData.append("selfie", selfie);
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("status", status);
    formData.append("date", selectdate.toLocaleDateString("en-CA"));

    try {
      const res = await fetch(
        "https://shiftmate-back.onrender.com/api/attendance/mark",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to mark attendance.");
      }

      const data = await res.json();
      const formattedDate = selectdate.toLocaleDateString("en-CA");
      console.log(data);

      setAttendance((prev) => ({
        ...prev,
        [formattedDate]: {
          status: "present",
          imageUrl: data.selfieUrl,
          location: data.location,
        },
      }));

      setSelfie(null);
      setShowCamera(false);
      alert("Attendance marked successfully!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
  
    console.log("Requesting location...");
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Coordinates received:", latitude, longitude);
  
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
  
          const data = await response.json();
          console.log("Reverse geocoding data:", data);
  
          setLocation({
            latitude,
            longitude,
            address: data.display_name || `Lat: ${latitude}, Lon: ${longitude}`,
          });
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Failed to fetch address from coordinates.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(
          `Error getting location: ${error.message}. Make sure location permissions are enabled.`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  

  const fetchAttend = async () => {
    try {
      const res = await fetch(
        "https://shiftmate-back.onrender.com/api/attendance/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch attendance");

      const data = await res.json();
      console.log(data);

      const map = {};
      data.records.forEach((entry) => {
        const formattedDate = new Date(entry.date).toLocaleDateString("en-CA");
        map[formattedDate] = {
          status: entry.status,
          imageUrl: entry.imageUrl,
          location: entry.location,
        };
      });
      setAttendance(map);
    } catch (error) {
      console.log("Error fetching attendance", error);
    }
  };

  useEffect(() => {
    fetchAttend();
  }, []);

  const fetchAttendanceDetails = async (rawDate) => {
    const token = localStorage.getItem("token");
    const date = new Date(rawDate).toLocaleDateString("en-CA");
    try {
      const res = await fetch(
        `https://shiftmate-back.onrender.com/api/attendance/day/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();

      const formattedDate = new Date(data.date).toLocaleDateString("en-CA");

      const { latitude, longitude } = data.location;

      const locationResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "attendance-app/1.0",
            "Accept-Language": "en",
          },
        }
      );
      const locationData = await locationResponse.json();
      console.log(locationData);

      setAttendanceDetails({
        date: formattedDate,
        status: data.status,
        imageUrl: data.imageUrl,
        location:
          locationData.display_name || `Lat: ${latitude}, Lon: ${longitude}`,
      });
      setShowAttendancePopup(true);
    } catch (error) {
      console.log("Failed to fetch attendance detail", error);
    }
  };

  return (
    <div className="employee-con">
      <div className="detail-employee">
        <div className="attendance-calender">
          <h2 className="text-xl font-bold my-4">Attendance Calendar</h2>

          <div className="set-status">
            <label className="status block mt-4">
              Select Attendance Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border status-details rounded px-2 py-1 w-full"
            >
              <option value="">-- Select Status --</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="calender-emp">
            {daysInMonth.map((day) => {
              const dateKey = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                day
              ).toLocaleDateString("en-CA");

              let bgColor = "bg-blue-100"; // Default color

              const dayData = attendance[dateKey];
              const attendanceStatus = dayData?.status;

              if (attendanceStatus === "present") {
                bgColor = "bg-green-500"; // Green for present
              } else if (attendanceStatus === "absent") {
                bgColor = "bg-red-500"; // Red for absent
              } else if (attendanceStatus === "remote") {
                bgColor = "bg-yellow-500"; // Blue for remote
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${bgColor} text-white`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {showCamera && (
            <div className="mt-4 bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Capture Selfie</h3>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-60 object-cover"
              />
              <button
                onClick={capture}
                className="mt-2 px-4 capture-btn py-2 bg-blue-500 text-white rounded"
              >
                Capture
              </button>
            </div>
          )}

          {selfie && (
            <div className="mt-4">
              <h4 className="font-semibold">Preview:</h4>
              <img
                src={URL.createObjectURL(selfie)}
                alt="Captured Selfie"
                className="w-40 h-40 object-cover sefie-img rounded border"
              />
              <p className="text-sm mt-2">Location: {location.address}</p>
              <button
                onClick={handleMarkAttendance}
                className="mt-2 view-btn px-4 py-2 text-white rounded"
              >
                Mark Attendance
              </button>
            </div>
          )}
          <button
            onClick={fetchLocation}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded"
          >
            Fetch Location
          </button>

          {location.latitude && location.longitude && (
            <div className="mt-2 text-sm text-gray-700">
              <p>Latitude: {location.latitude}</p>
              <p>Longitude: {location.longitude}</p>
              <p>Address: {location.address}</p>
            </div>
          )}
          <p className="text-sm mt-2">Location: {location.address}</p>
        </div>
        <div className="attendance-view">
          <button
            className="view-btn"
            onClick={async () => {
              const today = new Date();
              const token = localStorage.getItem("token");
              const dateStr = today.toLocaleDateString("en-CA");

              const res = await fetch(
                `https://shiftmate-back.onrender.com/api/attendance/day/${dateStr}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!res.ok) {
                alert("No attendance marked for today.");
                return;
              }

              const data = await res.json();
              if (!data || !data.date) {
                alert("No attendance marked for today.");
                return;
              }

              fetchAttendanceDetails(today);
            }}
          >
            View Today's Attendance
          </button>
          {showAttendancePopup && attendanceDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-80">
                <h3 className="text-xl font-semibold">Attendance Details</h3>
                <p>Date: {attendanceDetails.date}</p>
                <p>Status: {attendanceDetails.status}</p>
                <p className="text-sm mt-2">
                  Location:{" "}
                  {attendanceDetails?.location || "Location not available"}
                </p>
                <div className="view-info">
                  <img
                    src={attendanceDetails.imageUrl}
                    alt="Attendance Selfie"
                    className="w-40 h-40 object-cover sefie-img rounded mt-2"
                  />
                  <button
                    onClick={() => setShowAttendancePopup(false)}
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
