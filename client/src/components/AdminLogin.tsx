import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); // Reset error state

    try {
      // Ensure the endpoint matches your server.js setup
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId: adminId, password }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        // Strict role check for 'administrator'
        if (data.user.roles.includes('administrator')) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Must match the path defined in App.tsx
          navigate('/admin-dashboard');
        } else {
          setErrorMsg("Access Denied: You do not have Administrative privileges.");
        }
      } else {
        setErrorMsg(data.message || "Invalid Admin Credentials");
      }
    } catch (error) {
      console.error("Admin Login network error:", error);
      setErrorMsg("Network error: Is the server running on Port 5000?");
    }
  };

  return (
    <div className="auth-container" style={{ 
      backgroundColor: '#1a1a1a', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <form 
        className="auth-form" 
        onSubmit={handleAdminSubmit} 
        style={{ 
          backgroundColor: '#fff', 
          padding: '2rem', 
          borderRadius: '8px', 
          width: '350px', 
          borderTop: '5px solid #dc3545',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <h2 style={{ color: '#dc3545', textAlign: 'center', marginBottom: '0.5rem' }}>System Administration</h2>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>Secure Portal Access</p>
        
        {errorMsg && (
          <div style={{ 
            color: '#dc3545', 
            backgroundColor: '#fee2e2', 
            padding: '8px', 
            borderRadius: '4px', 
            fontSize: '0.8rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Admin ID</label>
        <input 
          type="text" 
          placeholder="Enter Admin ID" 
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
          required 
        />
        
        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          required 
        />
        
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#dc3545', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          Authorize Entry
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/login')} 
          style={{ 
            backgroundColor: 'transparent', 
            color: '#666', 
            marginTop: '15px', 
            fontSize: '0.8rem', 
            border: 'none', 
            width: '100%', 
            cursor: 'pointer' 
          }}
        >
          Back to User Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;