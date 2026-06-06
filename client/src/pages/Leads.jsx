import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeadModal from '../components/LeadModal';
import { 
  Search, 
  Filter, 
  UserPlus,
  Mail,
  Phone,
  Plus,
  ChevronRight,
  Download,
  Building,
  Tag,
  Briefcase,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigningLead, setAssigningLead] = useState(null); // leadId being assigned
  const [assigning, setAssigning] = useState(false);

  const canAssign = user?.role === 'Admin' || user?.role === 'Sales Manager';

  const fetchLeads = async () => {
    try {
      const { data } = await API.get('/leads');
      setLeads(data.data);
      setFilteredLeads(data.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    if (canAssign) {
      API.get('/auth/users').then(({ data }) => setUsers(data.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    let result = leads;
    if (search) {
      result = result.filter(lead => 
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.company?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    setFilteredLeads(result);
  }, [search, statusFilter, leads]);

  const handleExport = async () => {
    try {
      const response = await API.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAssign = async (leadId, userId) => {
    if (!userId) return;
    setAssigning(true);
    try {
      await API.post('/leads/assign', { leadId, userId });
      await fetchLeads();
      setAssigningLead(null);
    } catch (error) {
      console.error('Assign failed:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return '#10b981';
      case 'Contacted': return '#3b82f6';
      case 'Interested': return '#8b5cf6';
      case 'Follow-up': return '#f59e0b';
      case 'Closed': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>Leads Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your high-value sales opportunities</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {canAssign && (
            <button onClick={handleExport} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'transparent' }}>
              <Download size={18} />
              <span>Export Report</span>
            </button>
          )}
          {user?.role === 'Admin' && (
            <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '14px' }} onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              <span>Add New Lead</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '3rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, company or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '45px', background: 'transparent', border: 'none', fontSize: '1rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: '#111', border: 'none', fontWeight: '600', color: 'white', padding: '6px 10px', borderRadius: '8px' }}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
           <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem', textAlign: 'center' }}>
          <Briefcase size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No leads found matching your filters.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              className="glass-card"
              style={{ padding: '1.8rem', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'visible' }}
            >
              {/* Status Badge */}
              <div style={{ 
                position: 'absolute', top: '1.8rem', right: '1.8rem', 
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                background: `${getStatusColor(lead.status)}15`, color: getStatusColor(lead.status),
                border: `1px solid ${getStatusColor(lead.status)}30`
              }}>
                {lead.status.toUpperCase()}
              </div>

              {/* Card body — clicking navigates */}
              <div onClick={() => navigate(`/leads/${lead.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '15px', 
                    background: `linear-gradient(135deg, ${getStatusColor(lead.status)}, #10b981)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white', fontSize: '1.2rem'
                  }}>
                    {lead?.first_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{lead.first_name} {lead.last_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> {lead.company || 'Private Lead'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Mail size={14} /> {lead.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} /> {lead.phone}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lead.priority === 'High' ? 'var(--danger)' : lead.priority === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{lead.priority} Priority</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Assign button — Admin/Sales Manager only */}
                  {canAssign && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAssigningLead(assigningLead === lead.id ? null : lead.id); }}
                        title="Assign to agent"
                        style={{ 
                          padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700',
                          background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                      >
                        <UserPlus size={14} />
                        {lead.assigned_to_name ? lead.assigned_to_name.split(' ')[0] : 'Assign'}
                      </button>

                      {/* Assign dropdown */}
                      <AnimatePresence>
                        {assigningLead === lead.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute', bottom: '110%', right: 0, zIndex: 50,
                              background: '#111', border: '1px solid #222', borderRadius: '14px',
                              padding: '0.75rem', width: '200px',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign to</p>
                              <button onClick={() => setAssigningLead(null)} style={{ padding: '2px', background: 'transparent', color: 'var(--text-muted)' }}><X size={14} /></button>
                            </div>
                            <select
                              defaultValue=""
                              disabled={assigning}
                              onChange={(e) => { if (e.target.value) handleAssign(lead.id, e.target.value); }}
                              style={{ 
                                width: '100%', padding: '8px 10px', background: '#1a1a1a',
                                border: '1px solid #2a2a2a', borderRadius: '10px',
                                color: 'white', fontSize: '0.85rem', fontWeight: '600'
                              }}
                            >
                              <option value="" disabled>Select agent...</option>
                              {users.filter(u => u.role !== 'Client').map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    style={{ background: 'transparent', padding: '0', color: 'var(--primary)' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLeadCreated={fetchLeads} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Leads;


