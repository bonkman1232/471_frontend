import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || !user.roles.includes('student')) {
      navigate("/login");
    } else {
      fetchConsultations();
    }
  }, []);


  const fetchConsultations = async () => {
    const response = await fetch('/api/consultations/my-consultations', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    setConsultations(data);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>APCMS Student</h2>
        
      </header>

      <section className="user-card">
        <h3>Welcome, {user.name}</h3>
        <p><b>ID:</b> {user.universityId} | <b>Dept:</b> {user.department}</p>
      </section>

      <div className="action-grid">
        <button onClick={() => navigate("/request-consultation")}>Request Consultation</button>
        <button>Project / Thesis</button>
      </div>

      <h4>Your Upcoming Consultations</h4>
      <div className="data-list">
        {consultations.length > 0 ? (
          consultations.map((c: any) => (
            <div key={c._id} className="data-item">
              <span>{c.status}</span> - {new Date(c.preferredStart).toLocaleDateString()}
            </div>
          ))
        ) : <p>No consultations found.</p>}
      </div>
    </div>
  );
}