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
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>Team Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage roles and permissions for your sales force</p>
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
    </div>
  );
};

export default Users;
