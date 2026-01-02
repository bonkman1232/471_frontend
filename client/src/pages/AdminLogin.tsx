import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AdminLogin: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: adminId, password }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        // Verify the user actually has the admin role before proceeding
        if (data.user.roles.includes('administrator')) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/admin-dashboard');
        } else {
          alert("Access Denied: You do not have Administrative privileges.");
        }
      } else {
        alert(data.message || "Invalid Admin Credentials");
      }
    } catch (error) {
      console.error("Admin Login error:", error);
      alert("Server error.");
    }
  };

  return (
    <div className="auth-container" style={{ backgroundColor: '#1a1a1a' }}>
      <form className="auth-form" onSubmit={handleAdminSubmit} style={{ borderTop: '5px solid #dc3545' }}>
        <h2 style={{ color: '#dc3545' }}>System Administration</h2>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>Secure Portal Access</p>
        
        <label style={{ fontSize: '0.8rem' }}>Admin ID</label>
        <input 
          type="text" 
          placeholder="Enter Admin ID" 
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)} 
          required 
        />
        
        <label style={{ fontSize: '0.8rem' }}>Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <button type="submit" style={{ backgroundColor: '#dc3545' }}>Authorize Entry</button>
        
        <button 
          type="button" 
          onClick={() => navigate('/login')} 
          style={{ backgroundColor: 'transparent', color: '#666', marginTop: '10px', fontSize: '0.8rem', border: 'none' }}
        >
          Back to User Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;