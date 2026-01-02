import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterData, UserRole, FormErrors } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    universityId: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "student",
    department: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: "student", label: "Student", description: "Regular student user" },
    { value: "faculty", label: "Faculty", description: "Teacher/Professor" },
    { value: "admin", label: "Administrator", description: "System administrator" },
    { value: "supervisor", label: "Supervisor", description: "Project supervisor" },
    { value: "ST", label: "Student Teacher", description: "Teaching assistant" },
    { value: "RA", label: "Research Assistant", description: "Research assistant" },
    { value: "TA", label: "Teaching Assistant", description: "Teaching assistant" }
  ];

  const departmentOptions = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Architecture",
    "Other"
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // University ID validation
    if (!formData.universityId.trim()) {
      newErrors.universityId = "University ID is required";
    } else if (formData.universityId.length < 3) {
      newErrors.universityId = "University ID must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { confirmPassword, ...submitData } = formData;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Auto-login after successful registration
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setErrors({ ...errors, general: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors({ ...errors, general: "Server error. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            required
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="universityId">University ID</label>
          <input
            id="universityId"
            name="universityId"
            type="text"
            placeholder="Enter your university ID"
            value={formData.universityId}
            onChange={handleChange}
            className={errors.universityId ? 'error' : ''}
            required
          />
          {errors.universityId && <span className="error-text">{errors.universityId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            required
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
            required
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="roles">Role</label>
          <select
            id="roles"
            name="roles"
            value={formData.roles}
            onChange={handleChange}
            className={errors.roles ? 'error' : ''}
            required
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label} - {role.description}
              </option>
            ))}
          </select>
          {errors.roles && <span className="error-text">{errors.roles}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={errors.department ? 'error' : ''}
            required
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && <span className="error-text">{errors.department}</span>}
        </div>

        <button type="submit" disabled={isLoading} className={isLoading ? 'loading' : ''}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <div className="form-footer">
          <p>
            Already have an account? 
            <span className="link" onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;