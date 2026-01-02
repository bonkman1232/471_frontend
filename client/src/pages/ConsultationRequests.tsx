import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface Consultation {
  _id: string;
  requester: { name: string };
  reason: string;
  preferredStart: string;
  status: string;
}

const ConsultationRequests: React.FC = () => {
  const [requests, setRequests] = useState<Consultation[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/consultations/my-consultations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch requests.');
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      const updatedConsultation = await res.json();

    // Optimistically update frontend state
      setRequests(prev =>
        prev.map(r => r._id === updatedConsultation._id ? updatedConsultation : r)
      );

    } catch (error) {
      console.error(error);
      alert('Failed to update consultation status.');
    }
  };


  return (
    <div className="dashboard-container">
      <h2>Incoming Consultation Requests</h2>
      <table className="consultation-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Course (Reason)</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id}>
              <td>{req.requester?.name}</td>
              <td>{req.reason}</td>
              <td>{new Date(req.preferredStart).toLocaleString()}</td>
              <td>
                <button onClick={() => handleAction(req._id, 'accepted')}>Accept</button>
                <button onClick={() => handleAction(req._id, 'declined')}>Decline</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationRequests;
