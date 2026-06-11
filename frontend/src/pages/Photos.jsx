import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PhotoIcon, PlusIcon, CloseIcon, TrashIcon, EmptyIcon, ChevronRightIcon } from '../components/Icons';
import './Photos.css';

function Photos({ currentUser }) {
  const { username, albumId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [albumTitle, setAlbumTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAlbumAndPhotos();
  }, [currentUser, albumId]);

  const fetchAlbumAndPhotos = async () => {
    try {
      setLoading(true);
      const [albumsResponse, photosResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/users/${currentUser.id}/albums`),
        fetch(`http://localhost:3000/api/albums/${albumId}/photos`)
      ]);

      if (!albumsResponse.ok) throw new Error('Failed to fetch albums');
      if (!photosResponse.ok) throw new Error('Failed to fetch photos');

      const albums = await albumsResponse.json();
      const data = await photosResponse.json();
      const matchedAlbum = albums.find(album => String(album.id) === String(albumId));

      setAlbumTitle(matchedAlbum?.title || `Album #${albumId}`);
      setPhotos(data.sort((a, b) => a.id - b.id));
      setError('');
    } catch (err) {
      setError('Failed to load photos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and URL are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          album_id: albumId,
          title: formData.title.trim(),
          url: formData.url.trim(),
          thumbnailUrl: formData.url.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to create photo');
      const newPhoto = await response.json();
      setPhotos(prev => [...prev, newPhoto].sort((a, b) => a.id - b.id));
      setFormData({ title: '', url: '' });
      setShowForm(false);
      setSuccess('Photo added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add photo');
      console.error(err);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/photos/${photoId}?userId=${currentUser.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete photo');
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setSuccess('Photo deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete photo');
      console.error(err);
    }
  };

  return (
    <div className="photos-container">
      <div className="photos-header">
        <div className="header-title-wrapper">
          <div className="header-icon-container">
            <PhotoIcon size={28} className="header-icon" />
          </div>
          <div>
            <h2>{albumTitle}</h2>
          </div>
        </div>
        <div className="photos-header-actions">
          <Link to={`/users/${username}/albums`} className="btn-cancel photos-back-link">
            <ChevronRightIcon size={14} className="back-icon" />
            <span>Back to Albums</span>
          </Link>
          <button onClick={() => setShowForm(!showForm)} className={`btn-primary ${showForm ? 'btn-danger-type' : ''}`}>
            {showForm ? (
              <>
                <CloseIcon size={16} />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PlusIcon size={16} />
                <span>New Photo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleAddPhoto} className="photo-form">
          <input
            type="text"
            placeholder="Photo title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="form-input"
          />
          <input
            type="url"
            placeholder="Photo URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="form-input"
          />
          <div className="form-actions">
            <button type="submit" className="btn-save">
              <PlusIcon size={16} />
              <span>Add</span>
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
          <span>Loading photos...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <EmptyIcon size={48} className="empty-icon-svg" />
          </div>
          <h3>No photos yet</h3>
          <p>Add the first photo to this album.</p>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => (
            <article key={photo.id} className="photo-card">
              <div className="photo-preview">
                <img src={photo.thumbnailUrl || photo.url} alt={photo.title} loading="lazy" />
              </div>
              <div className="photo-content">
                <span className="photo-id">#{photo.id}</span>
                <h3>{photo.title}</h3>
                <a href={photo.url} target="_blank" rel="noreferrer" className="photo-link">
                  Open image
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo.id)}
                className="btn-action btn-delete photo-delete-btn"
                title="Delete photo"
              >
                <TrashIcon size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Photos;
