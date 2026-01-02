import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface Consultation {
  _id: string;
  faculty: { name: string };
  reason: string;
  preferredStart: string;
  status: string;
  feedbackForST?: { submittedAt?: string };
}

const MyConsultations: React.FC = () => {
  const [data, setData] = useState<Consultation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/consultations/my-consultations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch your consultations.');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>My Consultations</h2>

      {data.length === 0 && <p>No consultations yet.</p>}

      {data.map(c => (
        <div key={c._id} className="consultation-card">
          <p><strong>Faculty:</strong> {c.faculty?.name}</p>
          <p><strong>Course:</strong> {c.reason}</p>
          <p><strong>Time:</strong> {new Date(c.preferredStart).toLocaleString()}</p>
          <p><strong>Status:</strong> {c.status}</p>

          {c.status === 'accepted' && !c.feedbackForST?.submittedAt && (
            <button>Give Feedback</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyConsultations;
