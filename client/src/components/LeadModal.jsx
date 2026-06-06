import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const LeadModal = ({ isOpen, onClose, onLeadCreated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    priority: 'Medium',
    status: 'New',
    assigned_to: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const { data } = await API.get('/auth/users');
          setUsers(data.data);
        } catch (err) {
          console.error('Failed to load users:', err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }

    setLoading(true);
    try {
      const postData = { ...formData };
      if (!postData.assigned_to) {
        delete postData.assigned_to;
      } else {
        postData.assigned_to = Number(postData.assigned_to);
      }
      
      const response = await API.post('/leads', postData);
      toast.success('Lead created successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        priority: 'Medium',
        status: 'New',
        assigned_to: ''
      });
      onLeadCreated();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create lead';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }} onClick={onClose}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card"
          style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
            <X size={24} />
          </button>

          <h2 style={{ marginBottom: '1.5rem' }}>Add New Lead</h2>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <AlertCircle size={20} color="#ef4444" />
              <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>First Name</label>
                <input 
                  type="text" 
                  style={{ width: '100%' }}
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Name</label>
                <input 
                  type="text" 
                  style={{ width: '100%' }}
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  style={{ width: '100%' }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone</label>
                <input 
                  type="text" 
                  style={{ width: '100%' }}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Company</label>
              <input 
                type="text" 
                style={{ width: '100%' }}
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Assign To</label>
              <select 
                style={{ width: '100%' }}
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">Unassigned</option>
                {users.filter(u => u.role !== 'Client').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Priority</label>
                <select 
                  style={{ width: '100%' }}
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Source</label>
                <select 
                  style={{ width: '100%' }}
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="primary" disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadModal;
