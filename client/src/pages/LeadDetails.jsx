import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock,
  User,
  MessageSquare,
  Plus,
  Trash2,
  Tag,
  UserPlus,
  CheckCircle,
  FileText,
  Upload,
  Download,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef();
  
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [newNote, setNewNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [leadRes, notesRes, activitiesRes, followupsRes, usersRes, attachRes, tempRes] = await Promise.all([
          API.get(`/leads/${id}`),
          API.get(`/leads/${id}/notes`),
          API.get(`/activities/lead/${id}`),
          API.get(`/leads/${id}/followups`),
          API.get('/auth/users'),
          API.get(`/leads/${id}/attachments`),
          API.get('/templates')
        ]);
        setLead(leadRes.data.data);
        setNotes(notesRes.data.data);
        setActivities(activitiesRes.data.data);
        setFollowups(followupsRes.data.data);
        setUsers(usersRes.data.data);
        setAttachments(attachRes.data.data);
        setTemplates(tempRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await API.post(`/leads/${id}/notes`, { content: newNote });
      setNewNote('');
      const { data } = await API.get(`/leads/${id}/notes`);
      setNotes(data.data);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadId', id);
    
    try {
      await API.post('/leads/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { data } = await API.get(`/leads/${id}/attachments`);
      setAttachments(data.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const deleteAttachment = async (attachId) => {
    try {
      await API.delete(`/leads/attachments/${attachId}`);
      setAttachments(attachments.filter(a => a.id !== attachId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) return;
    try {
      await API.post('/leads/send-email', {
        leadId: id,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body
      });
      setShowEmailModal(false);
      alert('Email sent successfully!');
      // Refresh activity
      const { data } = await API.get(`/activities/lead/${id}`);
      setActivities(data.data);
    } catch (error) {
      console.error('Send failed:', error);
      alert('Failed to send email. Please check your SMTP settings.');
    }
  };

  const handleAssign = async (userId) => {
    try {
      await API.post('/leads/assign', { leadId: id, userId });
      setIsAssigning(false);
      const leadRes = await API.get(`/leads/${id}`);
      setLead(leadRes.data.data);
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await API.put(`/leads/${id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>;
  if (!lead) return <div style={{ padding: '2rem', textAlign: 'center' }}>Lead not found.</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/leads')}
          style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}
        >
          <ArrowLeft size={20} />
          Back to Pipeline
        </button>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Sales Manager' || currentUser?.role === 'Sales Agent') && (
            <button 
              onClick={() => setShowEmailModal(true)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              <Send size={18} />
              Email Client
            </button>
          )}
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Sales Manager') && (
            <button 
              onClick={() => setIsAssigning(!isAssigning)}
              className="glass-card"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}
            >
              <UserPlus size={18} />
              Assign Agent
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Side: Main Info & Files */}
        <div>
          {/* Info Card */}
          <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900' }}>{lead?.first_name?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '4px' }}>{lead.first_name} {lead.last_name}</h1>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> {lead.company}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> {lead.email}</span>
                    </p>
                  </div>
                </div>
                <select 
                  value={lead.status} 
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={currentUser?.role === 'Sales Intern' || (currentUser?.role === 'Sales Agent' && lead.assigned_to !== currentUser.id)}
                  style={{ 
                    background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold',
                    opacity: (currentUser?.role === 'Sales Intern' || (currentUser?.role === 'Sales Agent' && lead.assigned_to !== currentUser.id)) ? 0.6 : 1,
                    cursor: (currentUser?.role === 'Sales Intern' || (currentUser?.role === 'Sales Agent' && lead.assigned_to !== currentUser.id)) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                <div><p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Assigned To</p><p style={{ fontWeight: '700' }}>{lead.assigned_to_name || 'N/A'}</p></div>
                <div><p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source</p><p style={{ fontWeight: '700' }}>{lead.source}</p></div>
                <div><p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority</p><p style={{ fontWeight: '700', color: lead.priority === 'High' ? 'var(--danger)' : 'var(--warning)' }}>{lead.priority}</p></div>
                <div><p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone</p><p style={{ fontWeight: '700' }}>{lead.phone}</p></div>
             </div>
          </div>

          {/* Attachments Section */}
          <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                <FileText size={22} color="var(--accent)" />
                Lead Attachments
              </h3>
              <button 
                onClick={() => fileInputRef.current.click()}
                style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}
              >
                <Upload size={16} /> Upload PDF/DOC
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {attachments.map(file => (
                <div key={file.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <FileText size={24} color="var(--text-muted)" />
                    <button onClick={() => deleteAttachment(file.id)} style={{ color: 'var(--danger)', background: 'transparent' }}><Trash2 size={16} /></button>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.file_name}</p>
                  <a 
                    href={`http://localhost:5000/${file.file_path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
                  >
                    <Download size={12} /> Download
                  </a>
                </div>
              ))}
              {attachments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No documents uploaded yet.</p>}
            </div>
          </div>

          {/* Notes Hub */}
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
              <MessageSquare size={22} color="var(--primary)" />
              Notes Hub
            </h3>
            <form onSubmit={handleAddNote} style={{ marginBottom: '2rem' }}>
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Share an update about this lead..."
                style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}
              />
              <button type="submit" className="primary" style={{ marginTop: '1rem', marginLeft: 'auto', display: 'block' }}>Add Note</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notes.map(note => (
                <div key={note.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: '700', color: 'white' }}>{note.user_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                   </div>
                   <p style={{ fontSize: '0.95rem' }}>{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Followups */}
        <div>
           {/* Timeline */}
           <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '800' }}>
                <Clock size={20} color="var(--accent)" />
                History Timeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>
                {activities.slice(0, 10).map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '15px', position: 'relative', zIndex: 1 }}>
                     <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-dark)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                     </div>
                     <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{act.action.replace('_', ' ')}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.user_name} • {new Date(act.created_at).toLocaleTimeString()}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                   <h2 style={{ fontWeight: '900' }}>Send Email</h2>
                   <button onClick={() => setShowEmailModal(false)}><X /></button>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Template</label>
                   <select 
                    style={{ width: '100%' }}
                    onChange={(e) => {
                      const t = templates.find(temp => temp.id == e.target.value);
                      setSelectedTemplate(t);
                    }}
                   >
                      <option value="">Choose a template...</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>
                </div>

                {selectedTemplate && (
                  <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}><strong>Subject:</strong> {selectedTemplate.subject}</p>
                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{selectedTemplate.body.replace('{name}', lead.first_name)}</p>
                  </div>
                )}

                <button className="primary" style={{ width: '100%' }} onClick={handleSendEmail}>
                   <Send size={18} style={{ marginRight: '8px' }} /> Send to {lead.email}
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadDetails;
