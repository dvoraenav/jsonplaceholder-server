import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // Load user from LocalStorage if exists
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Helper function to handle logout (will be used by Navbar later)
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!currentUser ? <Login setCurrentUser={setCurrentUser} /> : <Navigate to={`/users/${currentUser.username}/todos`} />} 
        />
        <Route 
          path="/register" 
          element={!currentUser ? <Register /> : <Navigate to={`/users/${currentUser.username}/todos`} />} 
        />

        {/* Protected Application Routes (Only for logged-in users) */}
        <Route 
          path="/users/:username/todos" 
          element={currentUser ? (
            <div>
              {/* This is a temporary placeholder where your partner's Todos page will go */}
              <h1>Welcome {currentUser.name}! This is your Todos Page.</h1>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : <Navigate to="/login" />} 
        />

        <Route 
          path="/users/:username/posts" 
          element={currentUser ? (
            <div>
              {/* This is a temporary placeholder where your partner's Posts page will go */}
              <h1>Welcome {currentUser.name}! This is your Posts Page.</h1>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : <Navigate to="/login" />} 
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;