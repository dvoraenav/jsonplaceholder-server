import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Posts.css';

function Posts({ currentUser }) {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postFormData, setPostFormData] = useState({ title: '', body: '' });
  const [newCommentText, setNewCommentText] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!postFormData.title.trim() || !postFormData.body.trim()) {
      setError('Title and body are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          title: postFormData.title,
          body: postFormData.body
        })
      });
      if (!response.ok) throw new Error('Failed to create post');
      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setPostFormData({ title: '', body: '' });
      setShowPostForm(false);
      setSuccess('Post created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add post');
      console.error(err);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!postFormData.title.trim() || !postFormData.body.trim()) {
      setError('Title and body are required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${editingPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postFormData.title,
          body: postFormData.body
        })
      });
      if (!response.ok) throw new Error('Failed to update post');

      setPosts(posts.map(p =>
        p.id === editingPostId
          ? { ...p, title: postFormData.title, body: postFormData.body }
          : p
      ));
      resetPostForm();
      setSuccess('Post updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update post');
      console.error(err);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(p => p.id !== id));
      setSuccess('Post deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete post');
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          name: currentUser.name,
          email: currentUser.email,
          body: text
        })
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const newComment = await response.json();

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete comment');

      setPostComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
      setSuccess('Comment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setPostFormData({ title: post.title, body: post.body });
    setShowPostForm(true);
  };

  const resetPostForm = () => {
    setPostFormData({ title: '', body: '' });
    setEditingPostId(null);
    setShowPostForm(false);
    setError('');
  };

  const togglePostExpansion = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!postComments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  return (
    <div className="posts-container">
      <div className="posts-header">
        <div>
          <h2>📄 My Posts</h2>
          <p className="posts-subtitle">Share your thoughts and ideas</p>
        </div>
        <button onClick={() => setShowPostForm(!showPostForm)} className="btn-primary">
          {showPostForm ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showPostForm && (
        <form onSubmit={editingPostId ? handleUpdatePost : handleAddPost} className="post-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Post Title"
              value={postFormData.title}
              onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
              className="form-input"
              autoFocus
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Write your post content here..."
              value={postFormData.body}
              onChange={(e) => setPostFormData({ ...postFormData, body: e.target.value })}
              className="form-textarea"
              rows="5"
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingPostId ? '💾 Update' : '✓ Publish'}
            </button>
            <button type="button" onClick={resetPostForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Write your first post to share with the community!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-meta">
                      <span className="post-id">#{post.id}</span>
                      <h3 className="post-title">{post.title}</h3>
                    </div>
                    <div className="post-actions">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="btn-small btn-edit"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="btn-small btn-delete"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="post-body">
                    <p>{post.body}</p>
                  </div>

                  <div className="post-footer">
                    <button
                      onClick={() => togglePostExpansion(post.id)}
                      className="btn-expand"
                    >
                      {expandedPostId === post.id ? '▼ Hide Comments' : '▶ Show Comments'}
                      {postComments[post.id] && (
                        <span className="comment-count">
                          ({postComments[post.id].length})
                        </span>
                      )}
                    </button>
                  </div>

                  {expandedPostId === post.id && (
                    <div className="comments-section">
                      <div className="new-comment">
                        <div className="comment-input-group">
                          <textarea
                            placeholder="Add a comment..."
                            value={newCommentText[post.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            className="comment-input"
                            rows="2"
                          ></textarea>
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="btn-comment-submit"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>

                      <div className="comments-list">
                        {postComments[post.id] && postComments[post.id].length > 0 ? (
                          postComments[post.id].map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <strong className="comment-name">{comment.name}</strong>
                                <span className="comment-email">{comment.email}</span>
                              </div>
                              <p className="comment-body">{comment.body}</p>
                              <button
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="btn-small btn-delete-comment"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="no-comments">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Posts;
