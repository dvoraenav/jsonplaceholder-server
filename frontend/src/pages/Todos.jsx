import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TodoIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon, EmptyIcon, CheckIcon } from '../components/Icons';
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limitFilter, setLimitFilter] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [currentUser, searchQuery, statusFilter, limitFilter]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      
      // Build dynamic query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (statusFilter !== '') params.append('completed', statusFilter);
      if (limitFilter !== '') params.append('limit', limitFilter);
      
      const response = await fetch(`http://localhost:3000/api/users/${currentUser.id}/todos?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      
      // Explicitly sort items by ID
      const sortedTodos = data.sort((a, b) => a.id - b.id);
      setTodos(sortedTodos);
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
      setTodos([...todos, newTodo].sort((a, b) => a.id - b.id));
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
      ).sort((a, b) => a.id - b.id));
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
      ).sort((a, b) => a.id - b.id));
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
        <div className="header-title-wrapper">
          <div className="header-icon-container">
            <TodoIcon size={28} className="header-icon" />
          </div>
          <div>
            <h2>My Todos</h2>
            <p className="todos-subtitle">Manage your daily tasks</p>
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
              <span>New Todo</span>
            </>
          )}
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
              <label className="checkbox-label-custom">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Completed</span>
              </label>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              <CheckIcon size={16} />
              <span>{editingId ? 'Update' : 'Add'}</span>
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
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
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input-search"
          />
        </div>
        <div className="filter-selects">
          <div className="select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="true">Completed Only</option>
              <option value="false">Pending Only</option>
            </select>
          </div>
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
              <option value="50">Limit 50</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading todos...</span>
        </div>
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
              <div className="empty-icon-container">
                <EmptyIcon size={48} className="empty-icon-svg" />
              </div>
              <h3>No todos found</h3>
              <p>Try adjusting your search filters or create a new todo!</p>
            </div>
          ) : (
            <div className="todos-list">
              {todos.map((todo) => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-checkbox">
                    <label className="todo-checkbox-container">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-checkmark"></span>
                    </label>
                  </div>
                  <div className="todo-content">
                    <span className="todo-id">#{todo.id}</span>
                    <span className="todo-title">{todo.title}</span>
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="btn-action btn-edit"
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="btn-action btn-delete"
                      title="Delete"
                    >
                      <TrashIcon size={16} />
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
