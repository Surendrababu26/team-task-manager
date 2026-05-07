import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ListTodo, Plus, Trash2, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // This would normally be project members
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'pending', due_date: '', assigned_to: '', project: ''
  });
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get(`tasks/${filter ? `?status=${filter}` : ''}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchTasks();
      const [projRes, userRes] = await Promise.all([
        axiosInstance.get('projects/'),
        // In a real app, you'd fetch users from a specific endpoint or use project members
        axiosInstance.get('projects/') // Dummy for now, we'll use usernames
      ]);
      setProjects(projRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('tasks/', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', status: 'pending', due_date: '', assigned_to: '', project: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      console.log(`Updating task ID: ${id} (type: ${typeof id}) to status: ${newStatus}`);
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(t => {
          // Use == instead of === to be safe with string vs int IDs
          if (t.id == id) {
            console.log(`Matched task ${t.id}, updating status to ${newStatus}`);
            return { ...t, status: newStatus };
          }
          return t;
        })
      );
      
      const res = await axiosInstance.post(`tasks/${id}/update-status/`, { status: newStatus });
      console.log('Update successful:', res.data);
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message);
      fetchTasks(); // Revert on error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await axiosInstance.delete(`tasks/${id}/`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-pending',
      in_progress: 'badge-progress',
      completed: 'badge-completed',
      overdue: 'badge-overdue'
    };
    return <span className={`badge ${classes[status] || ''}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  if (loading) return <div className="container">Loading tasks...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ListTodo size={32} color="var(--primary)" />
          <h1>Tasks</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '8px' }}>
            <Filter size={16} style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', outline: 'none' }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {user.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} /> New Task
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                {getStatusBadge(task.status)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{task.description}</p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
                <span>Project: {task.project_name}</span>
                <span>Assigned to: {task.assigned_to_name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select 
                className="glass"
                value={task.status} 
                onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', color: 'white', outline: 'none' }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {user.role === 'admin' && (
                <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="glass card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No tasks found.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass card" style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>New Task</h2>
            <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="2" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Project</label>
                  <select value={newTask.project} onChange={(e) => setNewTask({...newTask, project: e.target.value})} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Assign To (ID)</label>
                  <input type="number" value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})} required placeholder="User ID" />
                </div>
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="datetime-local" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
