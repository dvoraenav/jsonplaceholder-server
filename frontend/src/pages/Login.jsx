import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoIcon } from '../components/Icons';
import './Auth.css'; // Importing the style sheet

function Login({ setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      navigate('/');
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
        <h2>Sign In</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <input type="text" className="auth-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <input type="password" className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;