import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TodoIcon, PostIcon, UserIcon, PlusIcon, ChevronRightIcon, EmptyIcon } from '../components/Icons';
import './Home.css';

function Home({ currentUser }) {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todosResponse, postsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/users/${currentUser.id}/todos`),
        fetch(`http://localhost:3000/api/users/${currentUser.id}/posts`)
      ]);

      if (!todosResponse.ok) throw new Error('Failed to fetch todos');
      if (!postsResponse.ok) throw new Error('Failed to fetch posts');

      const todosData = await todosResponse.json();
      const postsData = await postsResponse.json();

      setTodos(todosData);
      setPosts(postsData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          completed: !todo.completed
        })
      });
      if (!response.ok) throw new Error('Failed to update todo');
      
      setTodos(todos.map(t =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = todos.length - completedTodos;
  const completionPercentage = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;
  
  // Get top 4 pending tasks to show in the widget
  const recentPendingTodos = todos.filter(t => !t.completed).slice(0, 4);
  // Get top 2 posts to show in the widget
  const recentPosts = posts.slice(0, 2);

  if (loading) {
    return (
      <div className="dashboard-container loading-wrapper">
        <div className="spinner"></div>
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner Widget */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="banner-greeting">{getGreeting()},</span>
          <h1>{currentUser.name}</h1>
          <p className="banner-status">
            {pendingTodos === 0 
              ? 'You have caught up with all your tasks! Enjoy your day.' 
              : `You have ${pendingTodos} pending tasks on your checklist today.`}
          </p>
        </div>
        <div className="banner-badge">
          <span className="badge-pill">Dashboard Active</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Metrics Row Widget Grid */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Tasks Checklist</span>
            <div className="metric-icon-container">
              <TodoIcon size={20} />
            </div>
          </div>
          <div className="metric-body">
            <span className="metric-value">{completedTodos} / {todos.length}</span>
            <span className="metric-label">{completionPercentage}% Completed</span>
            <div className="metric-progress-bar">
              <div className="metric-progress-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Shared Thoughts</span>
            <div className="metric-icon-container">
              <PostIcon size={20} />
            </div>
          </div>
          <div className="metric-body">
            <span className="metric-value">{posts.length}</span>
            <span className="metric-label">Published Posts</span>
            <Link to={`/users/${currentUser.username}/posts`} className="metric-link">
              <span>View Feed</span>
              <ChevronRightIcon size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Widget Panel */}
      <div className="dashboard-grid">
        {/* Recent Pending Tasks Widget */}
        <div className="dashboard-widget-card">
          <div className="widget-header">
            <h3>Recent Tasks</h3>
            <Link to={`/users/${currentUser.username}/todos`} className="widget-header-link">
              <span>View All</span>
              <ChevronRightIcon size={14} />
            </Link>
          </div>
          <div className="widget-body">
            {recentPendingTodos.length === 0 ? (
              <div className="widget-empty-state">
                <EmptyIcon size={36} className="widget-empty-icon" />
                <p>No pending tasks</p>
                <Link to={`/users/${currentUser.username}/todos`} className="widget-empty-link">
                  Create a task
                </Link>
              </div>
            ) : (
              <div className="widget-todos-list">
                {recentPendingTodos.map(todo => (
                  <div key={todo.id} className="widget-todo-item">
                    <label className="todo-checkbox-container">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-checkmark"></span>
                    </label>
                    <span className="widget-todo-title">{todo.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Published Posts Widget */}
        <div className="dashboard-widget-card">
          <div className="widget-header">
            <h3>Recent Posts</h3>
            <Link to={`/users/${currentUser.username}/posts`} className="widget-header-link">
              <span>Manage Posts</span>
              <ChevronRightIcon size={14} />
            </Link>
          </div>
          <div className="widget-body">
            {recentPosts.length === 0 ? (
              <div className="widget-empty-state">
                <EmptyIcon size={36} className="widget-empty-icon" />
                <p>No posts published yet</p>
                <Link to={`/users/${currentUser.username}/posts`} className="widget-empty-link">
                  Write a post
                </Link>
              </div>
            ) : (
              <div className="widget-posts-list">
                {recentPosts.map(post => (
                  <div key={post.id} className="widget-post-item">
                    <h4 className="widget-post-title">{post.title}</h4>
                    <p className="widget-post-snippet">
                      {post.body.length > 90 ? `${post.body.substring(0, 90)}...` : post.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Widget */}
      <div className="quick-actions-widget">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="quick-actions-buttons">
          <Link to={`/users/${currentUser.username}/todos`} className="quick-action-btn">
            <PlusIcon size={16} />
            <span>Create New Task</span>
          </Link>
          <Link to={`/users/${currentUser.username}/posts`} className="quick-action-btn">
            <PlusIcon size={16} />
            <span>Write New Post</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
