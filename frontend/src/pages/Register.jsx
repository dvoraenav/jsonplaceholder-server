import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoIcon } from '../components/Icons';
import './Auth.css'; // Importing the style sheet

function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-container">
          <LogoIcon size={36} className="auth-logo" />
        </div>
        <h2>Create Account</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Registered successfully! Redirecting to login...</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <input type="text" className="auth-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <input type="text" className="auth-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <input type="email" className="auth-input" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <input type="password" className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;