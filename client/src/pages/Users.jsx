import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Users as UsersIcon, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldAlert,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Sales Agent' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/auth/users', formData);
      alert('User created successfully!');
      setFormData({ name: '', email: '', password: '', role: 'Sales Agent' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Create user failed:', error);
      alert(error.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, role, status) => {
    setUpdating(id);
    try {
      await API.put(`/auth/users/${id}`, { role, status });
      await fetchUsers();
      alert('User permissions updated!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update permissions.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  const roles = ['Admin', 'Sales Manager', 'Sales Agent', 'Sales Intern'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>Team Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage roles and permissions for your sales force</p>
        </div>
        <button 
          className="primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name / Email</th>
              <th style={{ padding: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>Loading team members...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.5rem' }}>
                  <p style={{ fontWeight: '800', color: 'white' }}>{u.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</p>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <select 
                    value={u.role}
                    onChange={(e) => {
                      const newUsers = users.map(user => user.id === u.id ? { ...user, role: e.target.value } : user);
                      setUsers(newUsers);
                    }}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', color: 'white' }}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'Active' ? 'var(--primary)' : 'var(--danger)' }}></div>
                     <select 
                        value={u.status}
                        onChange={(e) => {
                          const newUsers = users.map(user => user.id === u.id ? { ...user, status: e.target.value } : user);
                          setUsers(newUsers);
                        }}
                        style={{ background: 'transparent', border: 'none', fontWeight: '700', color: u.status === 'Active' ? 'white' : 'var(--danger)' }}
                      >
                        <option value="Active">Active</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                  </div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleUpdate(u.id, u.role, u.status)}
                      disabled={updating === u.id}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', 
                        padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <Save size={16} /> {updating === u.id ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', 
                        padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card" 
              style={{ width: '450px', padding: '2.5rem', position: 'relative' }}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', padding: 0, color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Add Team Member</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Create a new system user with specialized access rights.</p>
              
              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., John Doe"
                    style={{ width: '100%', padding: '12px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    style={{ width: '100%', padding: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Password</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    style={{ width: '100%', padding: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>System Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="glass-card" 
                    onClick={() => setIsModalOpen(false)}
                    style={{ flex: 1, padding: '12px', background: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary" 
                    disabled={saving}
                    style={{ flex: 1, padding: '12px' }}
                  >
                    {saving ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
