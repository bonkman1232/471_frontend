import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

interface Faculty {
  _id: string;
  name: string;
}

const RequestConsultation: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState({
    facultyId: '',
    reason: '',
    date: ''
  });
  const navigate = useNavigate();

  // Fetch all faculty
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/auth/faculty', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setFacultyList(data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch faculty.');
      }
    };
    fetchFaculty();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/consultations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          faculty: formData.facultyId,  // Must match backend
          reason: formData.reason,
          preferredStart: formData.date
        })
      });

      if (res.ok) {
        alert('Request sent successfully!');
        navigate('/student-dashboard');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to send request.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Request Consultation</h2>

        <label>Course Name / Reason</label>
        <input
          placeholder="e.g. Data Structures"
          value={formData.reason}
          onChange={e => setFormData({ ...formData, reason: e.target.value })}
          required
        />

        <label>Select Faculty</label>
        <select
          value={formData.facultyId}
          onChange={e => setFormData({ ...formData, facultyId: e.target.value })}
          required
        >
          <option value="">-- Choose a Faculty --</option>
          {facultyList.map(f => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>

        <label>Preferred Date & Time</label>
        <input
          type="datetime-local"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestConsultation;
