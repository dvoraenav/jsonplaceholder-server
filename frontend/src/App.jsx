import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import Posts from './pages/Posts';
import Home from './pages/Home';
import Navbar from './components/Navbar';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <Router>
      {currentUser && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!currentUser ? <Login setCurrentUser={setCurrentUser} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!currentUser ? <Register /> : <Navigate to="/" />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={currentUser ? <Home currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/todos"
          element={currentUser ? <Todos currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/posts"
          element={currentUser ? <Posts currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;