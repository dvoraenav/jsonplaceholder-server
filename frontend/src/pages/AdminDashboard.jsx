import React, { useState, useEffect } from 'react';
import { AdminIcon, UserIcon, EmptyIcon } from '../components/Icons';
import './AdminDashboard.css';

function AdminDashboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/admin/users?requesterId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    const nextBlocked = !user.is_blocked;
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${user.id}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_blocked: nextBlocked, requesterId: currentUser.id })
      });
      if (!response.ok) throw new Error('Failed to update block status');

      // Update the local array directly, no page refresh
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_blocked: nextBlocked ? 1 : 0 } : u
      ));
    } catch (err) {
      setError('Failed to update block status');
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title-wrapper">
          <div className="admin-icon-container">
            <AdminIcon size={28} className="admin-header-icon" />
          </div>
          <div>
            <h2>Admin Dashboard</h2>
            <p className="admin-subtitle">Manage users and account access</p>
          </div>
        </div>
        <span className="admin-count">{users.length} users</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <EmptyIcon size={48} className="empty-icon-svg" />
          </div>
          <h3>No users found</h3>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUser.id;
                const isBlocked = !!user.is_blocked;
                return (
                  <tr key={user.id} className={isBlocked ? 'row-blocked' : ''}>
                    <td className="cell-id">#{user.id}</td>
                    <td>
                      <div className="cell-name">
                        <UserIcon size={16} className="cell-name-icon" />
                        <span>{user.name}</span>
                        {user.is_admin ? <span className="badge badge-admin">Admin</span> : null}
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td className="cell-email">{user.email}</td>
                    <td>
                      {isBlocked ? (
                        <span className="badge badge-blocked">Blocked</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td>
                      {isSelf ? (
                        <span className="cell-self">You</span>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`btn-block ${isBlocked ? 'btn-unblock' : ''}`}
                        >
                          {isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
