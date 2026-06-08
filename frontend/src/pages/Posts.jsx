import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PostIcon, PlusIcon, CloseIcon, CheckIcon, EmptyIcon, EditIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, CommentIcon } from '../components/Icons';
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

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [limitFilter, setLimitFilter] = useState('');

  // Comment Editing States
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditData, setCommentEditData] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [currentUser, searchQuery, limitFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (limitFilter !== '') params.append('limit', limitFilter);

      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      
      // Enforce sorting by ID
      const sortedPosts = data.sort((a, b) => a.id - b.id);
      setPosts(sortedPosts);
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
      
      // Sort comments by ID
      const sortedComments = data.sort((a, b) => a.id - b.id);
      setPostComments(prev => ({ ...prev, [postId]: sortedComments }));
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
      setPosts([newPost, ...posts].sort((a, b) => a.id - b.id));
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
          body: postFormData.body,
          userId: currentUser.id // Enforce ownership verification parameter
        })
      });
      if (!response.ok) throw new Error('Failed to update post');

      setPosts(posts.map(p =>
        p.id === editingPostId
          ? { ...p, title: postFormData.title, body: postFormData.body }
          : p
      ).sort((a, b) => a.id - b.id));
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
      const response = await fetch(`http://localhost:3000/api/posts/${id}?userId=${currentUser.id}`, {
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
        [postId]: [...(prev[postId] || []), newComment].sort((a, b) => a.id - b.id)
      }));
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleUpdateComment = async (comment, postId) => {
    if (!commentEditData.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: comment.name,
          email: comment.email,
          body: commentEditData,
          requesterEmail: currentUser.email // Enforce ownership verification parameter
        })
      });

      if (!response.ok) throw new Error('Failed to update comment');

      setPostComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(c =>
          c.id === comment.id ? { ...c, body: commentEditData } : c
        ).sort((a, b) => a.id - b.id)
      }));

      setEditingCommentId(null);
      setCommentEditData('');
      setSuccess('Comment updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update comment');
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}?requesterEmail=${currentUser.email}`, {
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

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentEditData(comment.body);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setCommentEditData('');
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
        <div className="header-title-wrapper">
          <div className="header-icon-container">
            <PostIcon size={28} className="header-icon" />
          </div>
          <div>
            <h2>My Posts</h2>
            <p className="posts-subtitle">Share your thoughts and ideas</p>
          </div>
        </div>
        <button onClick={() => setShowPostForm(!showPostForm)} className={`btn-primary ${showPostForm ? 'btn-danger-type' : ''}`}>
          {showPostForm ? (
            <>
              <CloseIcon size={16} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              <span>New Post</span>
            </>
          )}
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
              <CheckIcon size={16} />
              <span>{editingPostId ? 'Update' : 'Publish'}</span>
            </button>
            <button type="button" onClick={resetPostForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Modern Search and Filters Widget Toolbar */}
      <div className="filters-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input-search"
          />
        </div>
        <div className="filter-selects">
          <div className="select-wrapper">
            <select
              value={limitFilter}
              onChange={(e) => setLimitFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Show All</option>
              <option value="5">Limit 5</option>
              <option value="10">Limit 10</option>
              <option value="20">Limit 20</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading posts...</span>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-container">
                <EmptyIcon size={48} className="empty-icon-svg" />
              </div>
              <h3>No posts found</h3>
              <p>Try adjusting your search criteria or write a new post!</p>
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
                    {post.user_id === currentUser.id && (
                      <div className="post-actions">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="btn-action btn-edit"
                          title="Edit"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="btn-action btn-delete"
                          title="Delete"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="post-body">
                    <p>{post.body}</p>
                  </div>

                  <div className="post-footer">
                    <button
                      onClick={() => togglePostExpansion(post.id)}
                      className="btn-expand"
                    >
                      {expandedPostId === post.id ? (
                        <>
                          <ChevronDownIcon size={14} className="comment-btn-icon" />
                          <span>Hide Comments</span>
                        </>
                      ) : (
                        <>
                          <ChevronRightIcon size={14} className="comment-btn-icon" />
                          <span>Show Comments</span>
                        </>
                      )}
                      {postComments[post.id] && (
                        <span className="comment-count">
                          {postComments[post.id].length}
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
                            <CommentIcon size={14} />
                            <span>Comment</span>
                          </button>
                        </div>
                      </div>

                      <div className="comments-list">
                        {postComments[post.id] && postComments[post.id].length > 0 ? (
                          postComments[post.id].map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header-row">
                                <div className="comment-meta">
                                  <strong className="comment-name">{comment.name}</strong>
                                  <span className="comment-email">{comment.email}</span>
                                </div>
                                {comment.email === currentUser.email && (
                                  <div className="comment-actions">
                                    <button
                                      onClick={() => startEditComment(comment)}
                                      className="btn-comment-action btn-comment-edit"
                                      title="Edit Comment"
                                    >
                                      <EditIcon size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      className="btn-comment-action btn-comment-delete"
                                      title="Delete Comment"
                                    >
                                      <TrashIcon size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {editingCommentId === comment.id ? (
                                <div className="comment-edit-box">
                                  <textarea
                                    value={commentEditData}
                                    onChange={(e) => setCommentEditData(e.target.value)}
                                    className="comment-edit-input"
                                    rows="2"
                                  />
                                  <div className="comment-edit-actions">
                                    <button
                                      onClick={() => handleUpdateComment(comment, post.id)}
                                      className="btn-save-comment"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEditComment}
                                      className="btn-cancel-comment"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="comment-body">{comment.body}</p>
                              )}
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
