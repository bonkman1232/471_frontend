import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

// --- 🟢 ADDED: NEW MODULE IMPORTS ---
import Messaging from "./Messaging";

interface TimeSlot {
  day: string;
  start: string;
  end: string;
}
// ------------------------------------

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // --- 🟢 ADDED: NEW STATE FOR YOUR MODULES ---
  const [showManager, setShowManager] = useState(false); 
  const [showChat, setShowChat] = useState(false);       
  const [availability, setAvailability] = useState('available');
  const [capacity, setCapacity] = useState(0);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  // --------------------------------------------

  useEffect(() => {
    if (!user || !user.roles.includes('faculty')) {
      navigate("/login");
    } else {
      fetchRequests();
      // --- 🟢 ADDED: FETCH YOUR SETTINGS ---
      fetchSettings();
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

  // --- 🟢 ADDED: NEW FUNCTIONS FOR YOUR MODULES ---
  const fetchSettings = async () => {
    if (user && user.id) {
      try {
        const res = await fetch(`/api/faculty/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if(data.availability) setAvailability(data.availability);
          if(data.capacity) setCapacity(data.capacity);
          if(data.slots) setSlots(data.slots);
        }
      } catch (err) { console.error("Error loading settings", err); }
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/faculty/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: user.id,
          availability,
          capacity: Number(capacity),
          slots
        })
      });
      if (res.ok) alert("✅ Settings Saved Successfully!");
    } catch (err) { alert("Error saving settings"); }
  };

  const handleAddSlot = () => setSlots([...slots, { day: 'Monday', start: '09:00', end: '10:00' }]);
  const handleRemoveSlot = (index: number) => setSlots(slots.filter((_, i) => i !== index));
  const handleSlotChange = (index: number, field: keyof TimeSlot, value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };
  // ------------------------------------------------

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>APCMS Faculty</h2>
      </header>

      <section className="user-card">
        <h3>Welcome, {user.name}</h3>
        <p><b>University ID:</b> {user.universityId} | <b>Dept:</b> {user.profile?.department || 'Not specified'}</p>
        {/* Status Badge */}
        <span style={{ 
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
          backgroundColor: availability === 'available' ? '#27ae60' : '#c0392b', color: 'white'
        }}>
          {availability.toUpperCase()}
        </span>
      </section>

      {/* --- 🟢 ADDED: ALWAYS VISIBLE SCHEDULE PREVIEW --- */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '5px solid #3498db' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>📅 My Office Hours (Current Schedule)</h4>
        {slots.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {slots.map((slot, index) => (
              <div key={index} style={{ background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}>
                <b style={{ color: '#2c3e50' }}>{slot.day}:</b> {slot.start} - {slot.end}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#777', fontStyle: 'italic' }}>No office hours set yet.</p>
        )}
      </div>

      <div className="action-grid">
        {/* ORIGINAL BUTTONS PRESERVED */}
        <button onClick={() => navigate("/consultation-requests")}>Consultation Requests ({requests.length})</button>
        <button onClick={() => navigate("/assign-student-tutor")}>Assign Student Tutor</button>
        <button onClick={() => navigate("/projects")}>Campus management system</button>
        
        {/* 🟢 ADDED: YOUR NEW ACTION BUTTONS */}
        <button 
          onClick={() => { setShowManager(!showManager); setShowChat(false); }}
          style={{ backgroundColor: showManager ? '#7f8c8d' : '#27ae60' }}
        >
          {showManager ? '❌ Close Manager' : '⚙️ Manage Availability'}
        </button>

        <button 
          onClick={() => { setShowChat(!showChat); setShowManager(false); }}
          style={{ backgroundColor: showChat ? '#7f8c8d' : '#2980b9' }}
        >
          {showChat ? '❌ Close Chat' : '💬 Student Messenger'}
        </button>
      </div>

      {/* --- 🟢 ADDED: YOUR MODULE COMPONENTS --- */}
      {showManager && (
        <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '2px solid #27ae60' }}>
          <h3 style={{ marginBottom: '15px' }}>Availability Manager</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block' }}>Status:</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                 {['available', 'busy', 'away'].map(status => (
                   <button key={status} onClick={() => setAvailability(status)}
                     style={{
                       flex: 1, padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                       backgroundColor: availability === status ? (status === 'available' ? '#27ae60' : '#c0392b') : '#f0f0f0',
                       color: availability === status ? 'white' : '#666'
                     }}>{status}</button>
                 ))}
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Office Hours:</label>
              <button onClick={handleAddSlot} style={{ marginLeft: '10px', fontSize: '12px' }}>+ Add</button>
              {slots.map((slot, index) => (
                <div key={index} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <input type="time" value={slot.start} onChange={(e) => handleSlotChange(index, 'start', e.target.value)} />
                  <input type="time" value={slot.end} onChange={(e) => handleSlotChange(index, 'end', e.target.value)} />
                  <button onClick={() => handleRemoveSlot(index)}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSaveSettings} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#2c3e50', color: 'white' }}>Save Settings</button>
        </div>
      )}

      {showChat && (
        <div style={{ marginTop: '20px', height: '600px', background: 'white', borderRadius: '8px', border: '2px solid #2980b9', overflow: 'hidden' }}>
           <Messaging />
        </div>
      )}

      {/* ORIGINAL PENDING REQUESTS PRESERVED */}
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
