import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoIcon, TodoIcon, PostIcon, UserIcon, LogoutIcon } from './Icons';
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
        <Link to="/" className="brand-link">
          <LogoIcon size={26} className="brand-icon" />
          <span className="brand-text">Taskflow</span>
        </Link>
      </div>
      <div className="navbar-menu">
        {currentUser && (
          <>
            <div className="nav-links">
              <Link to={`/users/${currentUser.username}/todos`} className="nav-link">
                <TodoIcon size={18} className="nav-icon" />
                <span>Todos</span>
              </Link>
              <Link to={`/users/${currentUser.username}/posts`} className="nav-link">
                <PostIcon size={18} className="nav-icon" />
                <span>Posts</span>
              </Link>
            </div>
            <div className="navbar-user">
              <div className="user-profile">
                <UserIcon size={18} className="user-icon" />
                <span className="user-name">{currentUser.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                <LogoutIcon size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
