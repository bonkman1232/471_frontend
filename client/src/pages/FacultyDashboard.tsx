import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || !user.roles.includes('faculty')) {
      navigate("/login");
    } else {
      fetchRequests();
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/consultations/my-consultations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>APCMS Faculty</h2>
        
      </header>

      <section className="user-card">
        <h3>Welcome, {user.name}</h3>
        <p><b>University ID:</b> {user.universityId} | <b>Dept:</b> {user.department}</p>
      </section>

      <div className="action-grid">
        <button onClick={() => navigate("/faculty-schedule")}>View My Schedule</button>
        <button onClick={() => navigate("/consultation-requests")}>Consultation Requests ({requests.length})</button>
        <button onClick={() => navigate("/assign-student-tutor")}>Assign Student Tutor</button>
        <button onClick={() => navigate("/projects")}>Campus management system</button>
      </div>

      <h4>Pending Requests</h4>
      <div className="data-list">
        {requests.filter((r: any) => r.status === 'pending').length > 0 ? (

          requests.map((r: any) => (
            <div key={r._id} className="data-item">
              <strong>{r.requester?.name}</strong> - {r.reason || 'No reason provided'}
            </div>
          ))
        ) : <p>No pending requests.</p>}
      </div>
    </div>
  );
}