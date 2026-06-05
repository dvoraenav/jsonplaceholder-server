import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>📝 MyApp</h1>
      </div>
      <div className="navbar-menu">
        {currentUser && (
          <>
            <Link to={`/users/${currentUser.username}/todos`} className="nav-link">
              📋 Todos
            </Link>
            <Link to={`/users/${currentUser.username}/posts`} className="nav-link">
              📄 Posts
            </Link>
            <div className="navbar-user">
              <span className="user-name">👤 {currentUser.name}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
