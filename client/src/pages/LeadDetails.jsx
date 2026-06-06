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

const FollowupForm = ({ leadId, onAdded }) => {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await API.post(`/leads/followups`, { leadId, scheduled_date: date, notes });
      setDate(''); setNotes(''); setOpen(false);
      onAdded();
    } catch (err) {
      console.error('Failed to add follow-up:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.25)', fontWeight: '700', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
        >
          <Plus size={16} /> Schedule Follow-up
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem' }}
          />
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', fontSize: '0.85rem', resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'var(--warning)', color: '#000', fontWeight: '800', fontSize: '0.85rem' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setOpen(false)} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

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
        const [leadRes, notesRes, activitiesRes, followupsRes, usersRes, attachRes, tempRes] = await Promise.allSettled([
          API.get(`/leads/${id}`),
          API.get(`/leads/${id}/notes`),
          API.get(`/activities/lead/${id}`),
          API.get(`/leads/${id}/followups`),
          API.get('/auth/users'),
          API.get(`/leads/${id}/attachments`),
          API.get('/templates')
        ]);

        if (leadRes.status === 'fulfilled') setLead(leadRes.value.data.data);
        if (notesRes.status === 'fulfilled') setNotes(notesRes.value.data.data);
        if (activitiesRes.status === 'fulfilled') setActivities(activitiesRes.value.data.data);
        if (followupsRes.status === 'fulfilled') setFollowups(followupsRes.value.data.data);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data);
        if (attachRes.status === 'fulfilled') setAttachments(attachRes.value.data.data);
        if (tempRes.status === 'fulfilled') setTemplates(tempRes.value.data.data);
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
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsAssigning(!isAssigning)}
                className="glass-card"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}
              >
                <UserPlus size={18} />
                Assign Agent
              </button>
              {isAssigning && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: '50px', zIndex: 10, width: '250px', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>Select team member:</p>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) handleAssign(e.target.value);
                    }}
                    defaultValue=""
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="">Select Agent...</option>
                    {users.filter(u => u.role !== 'Client').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
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
                {activities.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingLeft: '40px' }}>No activity recorded yet.</p>}
              </div>
           </div>

           {/* Followups Section */}
           <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '800' }}>
                <Calendar size={20} color="var(--warning)" />
                Follow-ups
              </h3>

              {/* Schedule new followup inline form */}
              <FollowupForm leadId={id} onAdded={async () => {
                const { data } = await API.get(`/leads/${id}/followups`);
                setFollowups(data.data);
              }} />

              {/* List of followups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                {followups.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No follow-ups scheduled yet.</p>
                )}
                {followups.map(f => {
                  const isOverdue = new Date(f.scheduled_date) < new Date() && f.status === 'Pending';
                  const isToday = new Date(f.scheduled_date).toDateString() === new Date().toDateString();
                  const color = f.status === 'Completed' ? 'var(--success)' : isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'var(--primary)';
                  return (
                    <div key={f.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${color}33`, borderLeft: `4px solid ${color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color, textTransform: 'uppercase' }}>
                          {f.status === 'Completed' ? 'Completed' : isOverdue ? 'Overdue' : isToday ? 'Today' : 'Upcoming'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(f.scheduled_date).toLocaleString()}
                        </span>
                      </div>
                      {f.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{f.notes}</p>}
                    </div>
                  );
                })}
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
