import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { 
  LayoutDashboard, 
  Users, 
  Building,
  LogOut, 
  Bell, 
  PieChart,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  User as UserIcon,
  FileText,
  X,
  MessageSquare,
  Check,
  Circle,
  Command,
  Users2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await API.put('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error(error);
    }
  };

  const markRead = async (id, leadId) => {
    try {
      await API.put(`/notifications/${id}/read`);
      if (leadId) {
        navigate(`/leads/${leadId}`);
      }
      fetchNotifications();
      setShowNotifications(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleIndividualMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const { data } = await API.get(`/search?q=${searchQuery}`);
          setSearchResults(data.data);
        } catch (error) {
          console.error(error);
          setSearchResults({ leads: [], users: [] });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
        setSearchQuery('');
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      if (e.key === 'Escape') {
        setSearchResults(null);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Leads Pipeline', path: '/leads', icon: <Users size={20} /> },
    { name: 'Follow-ups', path: '/followups', icon: <CalendarIcon size={20} /> },
  ];

  if (user?.role === 'Admin' || user?.role === 'Sales Manager') {
    navItems.push({ name: 'Performance Reports', path: '/reports', icon: <PieChart size={20} /> });
  }

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Team Management', path: '/users', icon: <UserIcon size={20} /> });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '14px', 
            background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' 
          }}>
            <Building size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>House of Elan</h1>
            <p style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.5px' }}>Gulberg • Islamabad</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => (
              <li key={item.name} style={{ marginBottom: '0.8rem' }}>
                <Link to={item.path} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 18px', 
                  textDecoration: 'none', color: isActive(item.path) ? 'white' : 'var(--text-muted)',
                  borderRadius: '16px', background: isActive(item.path) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: isActive(item.path) ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon}
                    <span style={{ fontWeight: '700' }}>{item.name}</span>
                  </div>
                  {isActive(item.path) && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white', fontSize: '1.2rem' }}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user?.name}</p>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '2px 8px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: 'var(--primary)', 
                    borderRadius: '6px', 
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    marginTop: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    {user?.role}
                  </div>
                </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '16px', fontWeight: '700' }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '90px', padding: '0 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          {/* Global Search Bar */}
          <div ref={searchRef} style={{ position: 'relative', width: '450px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Global intelligence search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px', paddingRight: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
              <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSearching ? (
                   <div style={{ width: '18px', height: '18px', border: '2px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <Command size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>K</span>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {searchResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 15, scale: 0.98 }}
                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 1000 }}
                >
                  <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                    {searchResults.leads.length === 0 && searchResults.users.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Search size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p style={{ fontWeight: '600' }}>No intelligence found for "{searchQuery}"</p>
                      </div>
                    ) : (
                      <>
                        {searchResults.leads.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px 10px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)', marginBottom: '8px' }}>
                              <FileText size={14} color="var(--primary)" />
                              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Leads & Pipelines</h4>
                            </div>
                            {searchResults.leads.map(lead => (
                              <div 
                                key={lead.id} 
                                onClick={() => { navigate(`/leads/${lead.id}`); setSearchResults(null); setSearchQuery(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <UserIcon size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{lead.first_name} {lead.last_name}</p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company} • {lead.email}</p>
                                </div>
                                <ChevronRight size={16} color="var(--border)" />
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.users && searchResults.users.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px 10px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)', marginBottom: '8px' }}>
                              <Users2 size={14} color="#6366f1" />
                              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Team Members</h4>
                            </div>
                            {searchResults.users.map(u => (
                              <div 
                                key={u.id} 
                                onClick={() => { navigate(`/users`); setSearchResults(null); setSearchQuery(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
                                  {u.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{u.name}</p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.role} • {u.email}</p>
                                </div>
                                <ChevronRight size={16} color="var(--border)" />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Notification Bell */}
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="glass-card" 
                style={{ padding: '12px', borderRadius: '14px', position: 'relative', background: 'rgba(255,255,255,0.03)', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Bell size={22} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
                {unreadCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid black', boxShadow: '0 0 10px var(--primary)' }}
                  ></motion.div>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '400px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 1000 }}
                  >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Notifications</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>You have {unreadCount} unread alerts</p>
                      </div>
                      <button 
                        onClick={markAllRead} 
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                      >
                        Mark all read
                      </button>
                    </div>
                    
                    <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '0.5rem' }} className="custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'inline-block', marginBottom: '15px' }}>
                            <Bell size={40} style={{ opacity: 0.2 }} />
                          </div>
                          <p style={{ fontWeight: '600' }}>No notifications found</p>
                          <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>We'll alert you when something important happens.</p>
                        </div>
                      ) : notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markRead(n.id, n.lead_id)}
                          style={{ 
                            padding: '1.2rem', borderRadius: '16px', marginBottom: '4px', cursor: 'pointer', 
                            background: n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.05)', 
                            transition: 'all 0.2s ease',
                            border: n.is_read ? '1px solid transparent' : '1px solid rgba(16, 185, 129, 0.1)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.05)'}
                        >
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ 
                              width: '44px', height: '44px', borderRadius: '14px', 
                              background: n.type === 'ASSIGNMENT' ? 'rgba(99, 102, 241, 0.1)' : n.type === 'REMINDER' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                              color: n.type === 'ASSIGNMENT' ? '#6366f1' : n.type === 'REMINDER' ? '#f59e0b' : 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                            }}>
                              {n.type === 'ASSIGNMENT' ? <UserIcon size={20} /> : n.type === 'REMINDER' ? <CalendarIcon size={20} /> : <MessageSquare size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <p style={{ fontSize: '0.9rem', color: n.is_read ? 'var(--text-muted)' : 'white', fontWeight: n.is_read ? '600' : '800', lineHeight: '1.5', marginRight: '10px' }}>{n.message}</p>
                                {!n.is_read && <button onClick={(e) => handleIndividualMarkRead(e, n.id)} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }} title="Mark as read"><Check size={16} /></button>}
                              </div>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={12} /> {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '1.2rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                       <Link to="/notifications" onClick={() => setShowNotifications(false)} style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '800', textDecoration: 'none' }}>View All Intelligence Alerts</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600' }}>Hello, <span style={{ color: 'white', fontWeight: '800' }}>{user?.name?.split(' ')[0] || 'User'}</span></p>
          </div>
        </header>

        <main style={{ padding: '3rem', overflowY: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {children}
          </motion.div>
        </main>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default Layout;
