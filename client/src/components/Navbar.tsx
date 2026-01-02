import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 👉 Show navbar ONLY on dashboards
  const isDashboard =
    location.pathname.startsWith('/student-dashboard') ||
    location.pathname.startsWith('/faculty-dashboard');

  if (!user || !isDashboard) return null;

  const isFaculty = user.roles.includes('faculty');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isFaculty ? '/faculty-dashboard' : '/student-dashboard'}>
          APCMS
        </Link>
      </div>

      <div className="navbar-user">
        <button className="user-btn" onClick={() => setOpen(!open)}>
          {user.name} ▾
        </button>

        {open && (
          <ul className="dropdown">
            {isFaculty ? (
              <>
                <li><Link to="/faculty-dashboard">Dashboard</Link></li>
                <li><Link to="/consultation-requests">Consultation Requests</Link></li>
                <li><Link to="/faculty-schedule">My Schedule</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/student-dashboard">Dashboard</Link></li>
                <li><Link to="/request-consultation">Request Consultation</Link></li>
                <li><Link to="/my-consultations">My Consultations</Link></li>
              </>
            )}
            <li className="divider" />
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
