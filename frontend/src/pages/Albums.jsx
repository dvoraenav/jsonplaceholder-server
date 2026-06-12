import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlbumIcon, PlusIcon, CloseIcon, TrashIcon, EmptyIcon, ChevronRightIcon } from '../components/Icons';
import { fetchWithCache, updateCacheItem, invalidateCache } from '../utils/apiCache';
import './Albums.css';

function Albums({ currentUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cache key for this user's albums collection
  const albumsUrl = `http://localhost:3000/api/users/${currentUser.id}/albums`;

  useEffect(() => {
    fetchAlbums();
  }, [currentUser]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await fetchWithCache(albumsUrl);
      setAlbums([...data].sort((a, b) => a.id - b.id));
      setError('');
    } catch (err) {
      setError('Failed to load albums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Album title is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, title: title.trim() })
      });
      if (!response.ok) throw new Error('Failed to create album');
      const newAlbum = await response.json();
      setAlbums(prev => [...prev, newAlbum].sort((a, b) => a.id - b.id));
      // Granular update: append the new album to the cached array
      updateCacheItem(albumsUrl, (cached) => [...cached, newAlbum]);
      setTitle('');
      setShowForm(false);
      setSuccess('Album created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add album');
      console.error(err);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Delete this album and all of its photos?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/albums/${albumId}?userId=${currentUser.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete album');
      setAlbums(prev => prev.filter(album => album.id !== albumId));
      // Granular update: drop only the deleted album from the cached array
      updateCacheItem(albumsUrl, (cached) => cached.filter(album => album.id !== albumId));
      // Cascade: the backend deletes this album's photos (ON DELETE CASCADE),
      // so its photos cache is now stale -> invalidate that key to force a refetch.
      invalidateCache(`http://localhost:3000/api/albums/${albumId}/photos`);
      setSuccess('Album deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete album');
      console.error(err);
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleAlbums = albums.filter((album) => {
    if (!normalizedSearchQuery) return true;
    const searchableText = `${album.title ?? ''} ${album.id ?? ''}`.toLowerCase();
    return searchableText.includes(normalizedSearchQuery);
  });

  return (
    <div className="albums-container">
      <div className="albums-header">
        <div className="header-title-wrapper">
          <div className="header-icon-container">
            <AlbumIcon size={28} className="header-icon" />
          </div>
          <div>
            <h2>My Albums</h2>
            <p className="albums-subtitle">Collect and browse your photo sets</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`btn-primary ${showForm ? 'btn-danger-type' : ''}`}>
          {showForm ? (
            <>
              <CloseIcon size={16} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              <span>New Album</span>
            </>
          )}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search albums by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input-search"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddAlbum} className="album-form">
          <input
            type="text"
            placeholder="Album title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" className="btn-save">
              <PlusIcon size={16} />
              <span>Create</span>
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading albums...</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <EmptyIcon size={48} className="empty-icon-svg" />
          </div>
          <h3>No albums yet</h3>
          <p>Create your first album to start organizing photos.</p>
        </div>
      ) : visibleAlbums.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <EmptyIcon size={48} className="empty-icon-svg" />
          </div>
          <h3>No albums found</h3>
          <p>Try adjusting your search.</p>
        </div>
      ) : (
        <div className="albums-grid">
          {visibleAlbums.map((album) => (
            <div key={album.id} className="album-card">
              <button
                type="button"
                className="album-card-main"
                onClick={() => navigate(`/users/${username}/albums/${album.id}/photos`)}
              >
                <div className="album-card-icon">
                  <AlbumIcon size={22} />
                </div>
                <div className="album-card-content">
                  <span className="album-id">#{album.id}</span>
                  <h3>{album.title}</h3>
                </div>
                <ChevronRightIcon size={16} className="album-card-arrow" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteAlbum(album.id)}
                className="btn-action btn-delete album-delete-btn"
                title="Delete album"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Albums;
