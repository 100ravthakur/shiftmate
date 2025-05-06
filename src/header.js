import { useNavigate } from "react-router-dom";
import './responsive.css';

const Header =  () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isLoggedIn = localStorage.getItem("token"); 

  return isLoggedIn ? (
    <>
      <div className="header">
        <div className="left-header">
          <h1>ShiftMate</h1>
        </div>
        <div className="right-header">
          <div className="logout">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null ;
}


export default Header;