import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Bell, 
  LayoutDashboard,
  Settings as SettingsIcon,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PipelineChart, SourceChart } from '../components/Charts';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import API from '../api/apiClient';

const Dashboard = () => {
  const { user, login } = useAuth(); // We'll use login to 'refresh' the user if needed, or just fetch locally
  const [activeView, setActiveView] = useState('overview');
  const [activeSettingTab, setActiveSettingTab] = useState('profile');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchFullUser = async () => {
    setLoadingUser(true);
    try {
      const { data } = await API.get('/auth/me');
      setFullUser(data.user);
    } catch (err) {
      toast.error('Failed to load full profile');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (activeView === 'settings') {
      fetchFullUser();
    }
  }, [activeView]);

  const stats = [
    { label: 'Active Leads', value: '1,284', change: '+12.5%', icon: <Target size={20} />, color: '#10b981' },
    { label: 'Conversations', value: '432', change: '+5.2%', icon: <Clock size={20} />, color: '#34d399' },
    { label: 'Closed Deals', value: '98', change: '+18.1%', icon: <CheckCircle size={20} />, color: '#059669' },
    { label: 'Conversion Rate', value: '24.2%', change: '+2.4%', icon: <TrendingUp size={20} />, color: '#10b981' },
  ];

  const settingTabs = [
    { id: 'profile', name: 'Profile Settings', icon: <User size={18} /> },
    { id: 'security', name: 'Security & Password', icon: <Lock size={18} /> },
    { id: 'notifications', name: 'Notification Prefs', icon: <Bell size={18} /> },
  ];

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().min(6, 'Must be at least 6 characters').required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your new password')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await API.put('/auth/update-password', {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        toast.success('Password updated successfully!');
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || err || 'Failed to update password');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const preferencesFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      notify_email: fullUser?.notify_email ?? true,
      notify_assignment: fullUser?.notify_assignment ?? true,
      notify_status_change: fullUser?.notify_status_change ?? true
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await API.put('/auth/preferences', values);
        toast.success('Preferences updated!');
        fetchFullUser();
      } catch (err) {
        toast.error('Failed to update preferences');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="animate-fade">
      {/* House of Elan Banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent)', padding: '1rem 2rem', borderRadius: '16px', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase' }}>Division: Gulberg & Islamabad</p>
      </div>
      
      {/* Top Toggle Navigation - Premium Style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            {activeView === 'overview' ? 'Performance Insights' : 'Account Settings'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeView === 'overview' ? 'Real-time analytics for your sales ecosystem' : 'Manage your identity and security preferences'}
          </p>
        </div>
        
        <div className="glass-card" style={{ display: 'inline-flex', padding: '5px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}>
          <button 
            onClick={() => setActiveView('overview')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px',
              background: activeView === 'overview' ? 'var(--primary)' : 'transparent',
              color: activeView === 'overview' ? 'white' : 'var(--text-muted)',
              boxShadow: activeView === 'overview' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <LayoutDashboard size={18} />
            <span style={{ fontWeight: '700' }}>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveView('settings')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px',
              background: activeView === 'settings' ? 'var(--primary)' : 'transparent',
              color: activeView === 'settings' ? 'white' : 'var(--text-muted)',
              boxShadow: activeView === 'settings' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <SettingsIcon size={18} />
            <span style={{ fontWeight: '700' }}>Settings</span>
          </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.8rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: stat.color, opacity: 0.1, borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>{stat.label}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: 1 }}>{stat.value}</p>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: stat.change.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', height: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: '800' }}>Lead Acquisition Pipeline</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Active Leads</span>
                </div>
              </div>
              <div style={{ height: '280px' }}>
                <PipelineChart />
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '2rem', height: '400px' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '2rem' }}>Lead Sources</h3>
              <div style={{ height: '200px', marginBottom: '2rem' }}>
                <SourceChart />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                 {['Website', 'Referral', 'Social', 'Cold Call'].map((s, i) => (
                   <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'][i] }}></div>
                     {s}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.2rem', height: 'fit-content' }}>
              {settingTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingTab(tab.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderRadius: '12px',
                    background: activeSettingTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeSettingTab === tab.id ? 'white' : 'var(--text-muted)',
                    marginBottom: '6px',
                    boxShadow: activeSettingTab === tab.id ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                  }}
                >
                  {tab.icon}
                  <span style={{ fontWeight: '700' }}>{tab.name}</span>
                </button>
              ))}
            </div>

            <div className="glass-card" style={{ padding: '3rem', minHeight: '500px' }}>
              {loadingUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                   <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                   <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Synchronizing profile data...</p>
                </div>
              ) : activeSettingTab === 'profile' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(45deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: '900', color: 'white' }}>{user?.name?.[0]}</div>
                      <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--primary)', padding: '6px', borderRadius: '10px', border: '3px solid var(--bg-card)' }}>
                        <TrendingUp size={14} color="white" />
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{user?.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{user?.role} • Active Status</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Display Name</label>
                      <input type="text" defaultValue={user?.name} style={{ width: '100%', padding: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Official Email</label>
                      <input type="email" defaultValue={user?.email} style={{ width: '100%', padding: '14px' }} />
                    </div>
                  </div>
                  <button className="primary" style={{ padding: '14px 32px', fontWeight: '700' }}>Update Profile</button>
                </div>
              ) : activeSettingTab === 'security' ? (
                <div>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Security Settings</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Ensure your account stays protected with a strong password.</p>
                  </div>

                  <form onSubmit={passwordFormik.handleSubmit} style={{ maxWidth: '500px' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          name="currentPassword"
                          type={showCurrentPass ? 'text' : 'password'}
                          {...passwordFormik.getFieldProps('currentPassword')}
                          placeholder="Enter current password"
                          style={{ 
                            width: '100%', paddingLeft: '45px', paddingRight: '45px',
                            borderColor: passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? 'var(--danger)' : 'var(--border)'
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', padding: 0, color: 'var(--text-muted)' }}
                        >
                          {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{passwordFormik.errors.currentPassword}</div>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <ShieldCheck size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          name="newPassword"
                          type={showNewPass ? 'text' : 'password'}
                          {...passwordFormik.getFieldProps('newPassword')}
                          placeholder="Min. 6 characters"
                          style={{ 
                            width: '100%', paddingLeft: '45px', paddingRight: '45px',
                            borderColor: passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? 'var(--danger)' : 'var(--border)'
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNewPass(!showNewPass)}
                          style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', padding: 0, color: 'var(--text-muted)' }}
                        >
                          {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{passwordFormik.errors.newPassword}</div>
                      )}
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <ShieldCheck size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          name="confirmPassword"
                          type="password"
                          {...passwordFormik.getFieldProps('confirmPassword')}
                          placeholder="Repeat new password"
                          style={{ 
                            width: '100%', paddingLeft: '45px',
                            borderColor: passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'var(--danger)' : 'var(--border)'
                          }}
                        />
                      </div>
                      {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px' }}>{passwordFormik.errors.confirmPassword}</div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className="primary" 
                      disabled={passwordFormik.isSubmitting}
                      style={{ padding: '14px 32px', fontWeight: '700', width: '200px' }}
                    >
                      {passwordFormik.isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Password'}
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Notification Channels</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Configure how you receive critical sales intelligence alerts.</p>
                  </div>

                  <form onSubmit={preferencesFormik.handleSubmit} style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                      
                      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
                             <Mail size={24} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Email Notifications</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receive daily summaries and critical alerts via email.</p>
                          </div>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            name="notify_email"
                            checked={preferencesFormik.values.notify_email}
                            onChange={preferencesFormik.handleChange}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--primary)' }}>
                             <UserPlus size={24} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Lead Assignments</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Instant notification when a new lead is assigned to you.</p>
                          </div>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            name="notify_assignment"
                            checked={preferencesFormik.values.notify_assignment}
                            onChange={preferencesFormik.handleChange}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
                             <RefreshCw size={24} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Status Updates</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get notified when lead status changes in the pipeline.</p>
                          </div>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            name="notify_status_change"
                            checked={preferencesFormik.values.notify_status_change}
                            onChange={preferencesFormik.handleChange}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>

                    </div>

                    <button 
                      type="submit" 
                      className="primary" 
                      disabled={preferencesFormik.isSubmitting}
                      style={{ padding: '14px 32px', fontWeight: '700', width: '240px' }}
                    >
                      {preferencesFormik.isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Update Preferences'}
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255,255,255,0.1);
          transition: .4s;
          border: 1px solid var(--border);
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--primary);
          border-color: var(--primary);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px var(--primary);
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
