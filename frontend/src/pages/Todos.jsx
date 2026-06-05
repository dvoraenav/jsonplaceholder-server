import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Todos.css';

function Todos({ currentUser }) {
  const { username } = useParams();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [currentUser]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          title: formData.title,
          completed: false
        })
      });
      if (!response.ok) throw new Error('Failed to create todo');
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setFormData({ title: '' });
      setShowForm(false);
      setSuccess('Todo added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const handleUpdateTodo = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/todos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          completed: formData.completed
        })
      });
      if (!response.ok) throw new Error('Failed to update todo');

      setTodos(todos.map(t =>
        t.id === editingId
          ? { ...t, title: formData.title, completed: formData.completed }
          : t
      ));
      resetForm();
      setSuccess('Todo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
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
      setError('Failed to toggle todo');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(t => t.id !== id));
      setSuccess('Todo deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleEditTodo = (todo) => {
    setEditingId(todo.id);
    setFormData({ title: todo.title, completed: todo.completed });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const completedCount = todos.filter(t => t.completed).length;
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="todos-container">
      <div className="todos-header">
        <div>
          <h2>📋 My Todos</h2>
          <p className="todos-subtitle">Manage your daily tasks</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ New Todo'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={editingId ? handleUpdateTodo : handleAddTodo} className="todo-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              autoFocus
            />
            {editingId && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                />
                Completed
              </label>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingId ? '💾 Update' : '✓ Add'}
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <>
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">{completedCount} of {todos.length} completed</span>
              <span className="progress-percent">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>

          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No todos yet</h3>
              <p>Create your first todo to get started!</p>
            </div>
          ) : (
            <div className="todos-list">
              {todos.map((todo) => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-checkbox">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo)}
                      className="checkbox-input"
                    />
                  </div>
                  <div className="todo-content">
                    <span className="todo-id">#{todo.id}</span>
                    <span className="todo-title">{todo.title}</span>
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="btn-small btn-edit"
                      title="Edit"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="btn-small btn-delete"
                      title="Delete"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Todos;
