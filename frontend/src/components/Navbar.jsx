import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoIcon, TodoIcon, PostIcon, UserIcon, LogoutIcon } from './Icons';
import './Navbar.css';

// Added setCurrentUser to the props destructuring to update header layout live
function Navbar({ currentUser, onLogout, setCurrentUser }) {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', username: '', password: '' });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleStartEdit = () => {
    setEditFormData({
      name: currentUser.name,
      email: currentUser.email,
      username: currentUser.username,
      password: '' // Keep explicitly empty to detect intentional changes
    });
    setModalError('');
    setModalSuccess('');
    setIsEditing(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      setModalError('Name and Email are required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      // Strict password change validation checking for actual user-typed content
      const isPasswordChanged = editFormData.password && editFormData.password.trim().length > 0;

      if (isPasswordChanged) {
        // Scenario A: Password was changed intentionally -> Force login redirect
        setShowProfileModal(false);
        onLogout();
        navigate('/login');
      } else {
        // Scenario B: Only name/email were changed -> Update React context state live and stay logged in
        if (setCurrentUser) {
          setCurrentUser(prev => ({ 
            ...prev, 
            name: editFormData.name, 
            email: editFormData.email 
          }));
        }
        setModalSuccess('Profile details updated successfully!');
        setModalError('');
        setIsEditing(false);
      }
      
    } catch (err) {
      setModalError('Failed to update profile details');
      console.error(err);
    }
  };

  return (
    <>
      {/* Main Navigation Bar */}
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
                <div 
                  className="user-profile" 
                  onClick={() => { setShowProfileModal(true); setIsEditing(false); setModalError(''); setModalSuccess(''); }} 
                  title="View Profile"
                >
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

      {/* Profile Modal Component */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>User Profile</h3>
              <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            
            <div className="profile-modal-body">
              <div className="profile-modal-avatar">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {modalSuccess && <div className="modal-alert modal-alert-success">{modalSuccess}</div>}
              {modalError && <div className="modal-alert modal-alert-error">{modalError}</div>}
              
              <div className="profile-modal-info">
                <div className="profile-info-field">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editFormData.name} 
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="modal-input-field"
                    />
                  ) : (
                    <p>{currentUser.name}</p>
                  )}
                </div>

                <div className="profile-info-field">
                  <label>Username</label>
                  <p>{currentUser.username}</p>
                </div>

                <div className="profile-info-field">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={editFormData.email} 
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="modal-input-field"
                    />
                  ) : (
                    <p>{currentUser.email}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="profile-info-field">
                    <label>New Password (Leave blank to keep current)</label>
                   <input 
                      type="password" 
                      placeholder="Enter new password"
                      value={editFormData.password} 
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="modal-input-field"
                      autoComplete="new-password"
                    />
                  </div>
                )}
              </div>

              <div className="modal-action-footer">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveChanges} className="modal-btn-save">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="modal-btn-cancel">Cancel</button>
                  </>
                ) : (
                  <button onClick={handleStartEdit} className="modal-btn-edit">Edit Profile</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
