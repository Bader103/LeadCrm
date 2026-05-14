import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Followups = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        // We'll need a new endpoint for all followups or just fetch by user
        const { data } = await API.get('/leads/followups/all');
        setFollowups(data.data);
      } catch (error) {
        console.error('Error fetching followups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  const isOverdue = (date) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>Follow-up Schedule</h2>
        <p style={{ color: 'var(--text-muted)' }}>Never miss a connection with your potential clients</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>Loading schedule...</div>
        ) : followups.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', gridColumn: '1/-1', padding: '4rem' }}>
            <CalendarIcon size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <h3>No upcoming follow-ups</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your schedule is clear for now.</p>
          </div>
        ) : followups.map((f, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={f.id} 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              borderLeft: `6px solid ${isOverdue(f.scheduled_date) ? 'var(--danger)' : isToday(f.scheduled_date) ? 'var(--warning)' : 'var(--primary)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: '800', 
                padding: '4px 10px', 
                borderRadius: '6px',
                background: isOverdue(f.scheduled_date) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: isOverdue(f.scheduled_date) ? 'var(--danger)' : 'var(--primary)'
              }}>
                {isOverdue(f.scheduled_date) ? 'OVERDUE' : isToday(f.scheduled_date) ? 'TODAY' : 'UPCOMING'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                {new Date(f.scheduled_date).toLocaleDateString()}
              </span>
            </div>

            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{f.lead_name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem', minHeight: '40px' }}>{f.notes}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <CheckCircle size={18} />
                </button>
                <button style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                  <Phone size={18} />
                </button>
              </div>
              <button 
                onClick={() => window.location.href = `/leads/${f.lead_id}`}
                style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View Lead <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Followups;
