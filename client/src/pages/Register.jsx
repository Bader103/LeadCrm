import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'Sales Manager', label: 'Sales Manager' },
    { value: 'Sales Agent', label: 'Sales Agent' },
    { value: 'Sales Intern', label: 'Sales Intern' },
    { value: 'Admin', label: 'System Administrator' }
  ];

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'Sales Agent'
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register(values);
        toast.success('Account created successfully!');
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '480px', padding: '3rem', border: '1px solid #1a1a1a' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1.2rem', 
            background: 'var(--primary)', 
            borderRadius: '20px',
            marginBottom: '1.5rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
          }}>
            <UserPlus color="white" size={40} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>Join the Team</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create your specialized CRM profile</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: formik.touched.name && formik.errors.name ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input 
                name="name"
                type="text" 
                {...formik.getFieldProps('name')}
                placeholder="John Doe"
                style={{ 
                  width: '100%', 
                  paddingLeft: '45px', 
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: formik.touched.name && formik.errors.name ? 'var(--danger)' : 'var(--border)'
                }}
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
              <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px', fontWeight: '600' }}>{formik.errors.name}</div>
            ) : null}
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Official Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: formik.touched.email && formik.errors.email ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input 
                name="email"
                type="email" 
                {...formik.getFieldProps('email')}
                placeholder="john@company.com"
                style={{ 
                  width: '100%', 
                  paddingLeft: '45px', 
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: formik.touched.email && formik.errors.email ? 'var(--danger)' : 'var(--border)'
                }}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px', fontWeight: '600' }}>{formik.errors.email}</div>
            ) : null}
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Access Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: formik.touched.password && formik.errors.password ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input 
                name="password"
                type="password" 
                {...formik.getFieldProps('password')}
                placeholder="••••••••"
                style={{ 
                  width: '100%', 
                  paddingLeft: '45px', 
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: formik.touched.password && formik.errors.password ? 'var(--danger)' : 'var(--border)'
                }}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '5px', fontWeight: '600' }}>{formik.errors.password}</div>
            ) : null}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Organizational Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                name="role"
                {...formik.getFieldProps('role')}
                style={{ width: '100%', paddingLeft: '45px', background: 'rgba(255,255,255,0.03)', appearance: 'none' }}
              >
                {roles.map(r => <option key={r.value} value={r.value} style={{ background: '#0a0a0a' }}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1rem', 
              fontWeight: '800', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }} 
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already a member? </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Sign in here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
