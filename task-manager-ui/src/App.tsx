import React, { useState, useEffect, useMemo } from 'react';
import { Task } from './types/Task';
import api from './services/api';

type FilterType = 'all' | 'active' | 'completed';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get<Task[]>('/tasks');
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    try {
      const response = await api.post<Task>('/tasks', { description: newTaskDesc });
      setTasks([...tasks, response.data]);
      setNewTaskDesc(''); // Clear input
    } catch (err) {
      setError('Failed to add task.');
      console.error(err);
    }
  };

  // Handle toggling task completion
  const handleToggleTask = async (id: string) => {
    try {
      const response = await api.put<Task>(`/tasks/${id}`);
      setTasks(tasks.map(t => (t.id === id ? response.data : t)));
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    }
  };

  // Memoized filtered tasks (Enhancement)
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.isCompleted);
      case 'completed':
        return tasks.filter(t => t.isCompleted);
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">Basic Task Manager</h1>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter a new task..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Add Task</button>
            </div>
          </form>

          {/* Filter Buttons (Enhancement) */}
          <div className="btn-group mb-3 d-flex" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filter === 'active' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`btn ${filter === 'completed' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ul className="list-group">
              {filteredTasks.map(task => (
                <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span 
                    onClick={() => handleToggleTask(task.id)}
                    style={{ 
                      cursor: 'pointer',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      color: task.isCompleted ? '#888' : '#000'
                    }}
                  >
                    {task.description}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;