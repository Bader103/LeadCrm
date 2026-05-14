import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Mail,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User size={18} /> },
    { id: 'security', name: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'display', name: 'Display', icon: <Palette size={18} /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile and application preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Tabs */}
        <div className="glass-card" style={{ padding: '1rem', height: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                borderRadius: '10px',
                textAlign: 'left',
                marginBottom: '4px'
              }}
            >
              {tab.icon}
              <span style={{ fontWeight: '500' }}>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Personal Information</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(45deg, #6366f1, #0ea5e9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <button style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    padding: '8px', 
                    borderRadius: '50%', 
                    background: 'var(--primary)',
                    border: '4px solid var(--bg-card)'
                  }}>
                    <Camera size={14} color="white" />
                  </button>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{user?.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.role}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Full Name</label>
                  <input type="text" defaultValue={user?.name} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" defaultValue={user?.email} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Phone Number</label>
                  <input type="text" placeholder="+1 (555) 000-0000" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Location</label>
                  <input type="text" placeholder="New York, USA" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Security Settings</h3>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Password</label>
                <input type="password" style={{ width: '100%', maxWidth: '400px' }} />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>New Password</label>
                <input type="password" style={{ width: '100%', maxWidth: '400px' }} />
              </div>
              <div style={{ textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                   Update Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
