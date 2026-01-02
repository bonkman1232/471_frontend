import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface Session {
  _id: string;
  status: string;
  notes: string;
  requester: { name: string, universityId: string };
  preferredStart: string;
  confirmedStart?: string;
}

const FacultySchedule: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/consultations/schedule', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch schedule.');
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>My Consultation Schedule</h2>
      {sessions.length === 0 && <p>No accepted consultations yet.</p>}

      <div className="schedule-grid">
        {sessions.map(session => (
          <div key={session._id} className="schedule-card">
            <div className="status-badge">{session.status}</div>
            <h4>{session.notes}</h4>
            <p><strong>Student:</strong> {session.requester?.name}</p>
            <p><strong>ID:</strong> {session.requester?.universityId}</p>
            <p><strong>Time:</strong> {new Date(session.confirmedStart || session.preferredStart).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultySchedule;
