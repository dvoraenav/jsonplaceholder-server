import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import Albums from './pages/Albums';
import Photos from './pages/Photos';
import Posts from './pages/Posts';
import Home from './pages/Home';
import Navbar from './components/Navbar';

function App() {
  const AlbumsPage = React.lazy(() => import('./pages/Albums'));
  const PhotosPage = React.lazy(() => import('./pages/Photos'));

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
      {currentUser && <Navbar currentUser={currentUser} onLogout={handleLogout} setCurrentUser={setCurrentUser}/>}
      <Routes>
        {/* Public Routes */}

        <Route
          path="/users/:username/albums"
          element={currentUser ? <React.Suspense fallback={<div className="loading"><div className="spinner"></div><span>Loading albums...</span></div>}><AlbumsPage currentUser={currentUser} /></React.Suspense> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/albums/:albumId/photos"
          element={currentUser ? <React.Suspense fallback={<div className="loading"><div className="spinner"></div><span>Loading photos...</span></div>}><PhotosPage currentUser={currentUser} /></React.Suspense> : <Navigate to="/login" />}
        />
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
          path="/users/:username/albums"
          element={currentUser ? <Albums currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/albums/:albumId/photos"
          element={currentUser ? <Photos currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/posts"
          element={currentUser ? <Posts currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        <Route
          path="/users/:username/posts/:postId/comments"
          element={currentUser ? <Posts currentUser={currentUser} /> : <Navigate to="/login" />}
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;