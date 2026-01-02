import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminAssignment from "./AdminAssignment"; // Your assignment module

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/admin-login");
      return;
    }

    // 2. Parse and Validate Role
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser.roles.includes('administrator')) {
      alert("Access Denied: You are not an administrator.");
      navigate("/login");
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{ 
        background: '#c0392b', 
        color: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Admin Dashboard</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>System Administration Portal</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>ID: {user.universityId}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Project Assignment Module */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
           <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginTop: 0, color: '#34495e' }}>
              Project Supervisor Assignment
           </h3>
           <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
              Assign or reassign faculty supervisors to student projects.
           </p>
           
           {/* Embedding your AdminAssignment component */}
           <AdminAssignment />
        </div>

      </div>
    </div>
  );
}