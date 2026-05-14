import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      role: 'Admin'
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        toast.success('Welcome back!');
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid credentials');
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
        style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid #1a1a1a' }}
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
            <ShieldCheck color="white" size={40} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>LeadCRM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Advanced sales intelligence portal</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: formik.touched.email && formik.errors.email ? 'var(--danger)' : 'var(--text-muted)' }} />
              <input 
                name="email"
                type="email" 
                {...formik.getFieldProps('email')}
                placeholder="admin@houseofelan.com"
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Security Password</label>
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
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Access Level (Role)</label>
            <select 
              name="role"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: 'white', padding: '12px' }}
              {...formik.getFieldProps('role')}
            >
              <option value="Admin">Admin</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Sales Agent">Sales Agent</option>
              <option value="Sales Intern">Sales Intern</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="primary" 
            disabled={formik.isSubmitting}
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
          >
            {formik.isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Authorized personnel only. </span>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Register Account</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
