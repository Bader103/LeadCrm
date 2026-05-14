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
  ExternalLink,
  ChevronRight,
  Download,
  Building,
  Calendar,
  Tag,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return '#10b981'; // Green
      case 'Contacted': return '#3b82f6'; // Blue
      case 'Interested': return '#8b5cf6'; // Purple
      case 'Follow-up': return '#f59e0b'; // Orange
      case 'Closed': return '#10b981'; // Green
      case 'Rejected': return '#ef4444'; // Red
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
          {(user?.role === 'Admin' || user?.role === 'Sales Manager') && (
            <button onClick={handleExport} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'transparent' }}>
              <Download size={18} />
              <span>Export Report</span>
            </button>
          )}
          {(user?.role === 'Admin' || user?.role === 'Sales Manager' || user?.role === 'Sales Agent') && (
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
            style={{ background: 'transparent', border: 'none', fontWeight: '600', color: 'white' }}
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
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="glass-card"
              style={{ padding: '1.8rem', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
            >
              {/* Status Indicator */}
              <div style={{ 
                position: 'absolute', top: '1.8rem', right: '1.8rem', 
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                background: `${getStatusColor(lead.status)}15`, color: getStatusColor(lead.status),
                border: `1px solid ${getStatusColor(lead.status)}30`
              }}>
                {lead.status.toUpperCase()}
              </div>

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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lead.priority === 'High' ? 'var(--danger)' : lead.priority === 'Medium' ? 'var(--warning)' : 'var(--text-muted)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{lead.priority} Priority</span>
                </div>
                <button style={{ background: 'transparent', padding: '0', color: 'var(--primary)' }}>
                  <ChevronRight size={20} />
                </button>
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
