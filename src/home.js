import './responsive.css';

function Home() {
    const { date, time } = getCurrentDateTime();

    function getCurrentDateTime() {
        const now = new Date();
      
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
      
        
        return { date, time };
      }
      
  return (
    <>
      <div className="dashboard-con">
        <div className="time-date">
            <p>Date: {date}</p>
            <p>Time: {time}</p>
        </div>
        <h2 className="dashboard-heading">Welcome to ShiftMate</h2>
        <p> Choose which role you have registered</p>
        <div className="user-con">
          <div className="left-log">
          <a href="https://shiftmate-five.vercel.app/login"> <img src="/images/manager-removebg-preview.png" alt="Manager"  width={230}/> </a>
            <h3><a href="https://shiftmate-five.vercel.app/login">Manager Login</a></h3>
          </div>
          <div className="right-log">
          <a href="https://shiftmate-five.vercel.app/login"><img src="/images/employee-removebg-preview.png" alt="Employee" width={230}/> </a>

            <h3><a href="https://shiftmate-five.vercel.app/login">Employee Login</a></h3>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
