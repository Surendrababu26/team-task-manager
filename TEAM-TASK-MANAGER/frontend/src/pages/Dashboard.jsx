import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, List } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('tasks/dashboard/');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Tasks', value: stats.total_tasks, icon: <List />, color: 'var(--primary)' },
    { title: 'Completed', value: stats.completed_tasks, icon: <CheckCircle />, color: 'var(--accent)' },
    { title: 'Pending', value: stats.pending_tasks, icon: <Clock />, color: '#f59e0b' },
    { title: 'Overdue', value: stats.overdue_tasks, icon: <AlertTriangle />, color: 'var(--danger)' },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <LayoutDashboard size={32} color="var(--primary)" />
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{card.title}</p>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{card.value}</h2>
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass card" style={{ padding: '2rem' }}>
        <h3>Quick Overview</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Welcome to your team management dashboard. Use the navigation to manage projects and tasks.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
