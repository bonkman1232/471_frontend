import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import './Dashboard.css';

// --- YOUR MODULE IMPORTS ---
import StudentView from "./Studentview";
import Messaging from "./Messaging";
// ---------------------------

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // --- STATE ---
  const [showDirectory, setShowDirectory] = useState(false);
  const [chatPartner, setChatPartner] = useState<any>(null);
  // -------------

  useEffect(() => {
    if (!user || !user.roles.includes('student')) {
      navigate("/login");
    } else {
      fetchConsultations();
    }
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultations/my-consultations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (err) {
      console.log("Consultations API not ready yet");
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>APCMS Student</h2>
      </header>

      <section className="user-card">
        <h3>Welcome, {user.name}</h3>
        <p><b>ID:</b> {user.universityId} | <b>Dept:</b> {user.profile?.department || 'Not specified'}</p>
      </section>

      <div className="action-grid">
        <button onClick={() => navigate("/request-consultation")}>Request Consultation</button>
        <button>Project / Thesis</button>

        <button 
           onClick={() => setShowDirectory(!showDirectory)}
           style={{ backgroundColor: showDirectory ? '#7f8c8d' : '#2980b9' }}
        >
           {showDirectory ? '❌ Close Directory' : '🔍 Find Faculty'}
        </button>
      </div>

      {/* --- FACULTY DIRECTORY MODULE --- */}
      {showDirectory && (
        <div style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px', animation: 'fadeIn 0.5s' }}>
           <h3 style={{ marginBottom: '15px' }}>Faculty Directory</h3>
           <StudentView onChatStart={(faculty) => setChatPartner(faculty)} />
        </div>
      )}

      {/* --- CONSULTATION LIST --- */}
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

      {/* --- 🟢 TALL & NARROW CHAT WIDGET --- */}
      {chatPartner && (
        <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000, 
            
            // --- UPDATED SIZE SETTINGS ---
            width: '350px',       // Back to original width
            height: '600px',      // Increased height (Tall)
            maxHeight: '80vh',    // Safety cap so it doesn't go off screen on small laptops
            // -----------------------------

            boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
              background: '#2c3e50', 
              color: 'white', 
              padding: '15px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontWeight: 'bold'
          }}>
            <span>Chat with {chatPartner.name}</span>
            <button 
               onClick={() => setChatPartner(null)}
               style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}
            >
              ✕
            </button>
          </div>
          
          {/* The Chat Component takes remaining space */}
          <div style={{ flex: 1, backgroundColor: 'white' }}>
             <Messaging initialPartner={chatPartner} />
          </div>
        </div>
      )}
      {/* --------------------------- */}
    </div>
  );
}
