import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ mobile: '9999999999', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.adminLogin(form.mobile, form.password);
      if (res.data.success) {
        const data = res.data.data;
        login({ name: data.name, mobile: data.mobile, role: data.role, userId: data.userId }, data.token);
        navigate('/admin');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check if backend is running.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.shield}>🛡️</div>
          <h2 style={styles.title}>Admin Portal</h2>
          <p style={styles.sub} className="serif">Sri Rathna Marriage Hall</p>
        </div>
        <div className="gold-divider" />

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.hint}>
          <strong>Default:</strong> Mobile: 9999999999 | Password: admin123
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Admin Mobile</label>
            <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Admin mobile number" required />
          </div>
          <div style={styles.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Admin password" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', background: 'linear-gradient(135deg, #8B1A1A, #5C0E0E)', color: '#C9A84C' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#5C3D2E', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate('/login')}>← Customer Login</span>
          <span style={{ color: '#aaa', margin: '0 10px' }}>|</span>
          <span style={{ color: '#5C3D2E', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0D0505 0%, #1A0A0A 100%)', padding: '20px' },
  card: { background: 'var(--cream)', borderRadius: '12px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,26,26,0.5)' },
  header: { textAlign: 'center', marginBottom: '24px' },
  shield: { fontSize: '40px', marginBottom: '10px' },
  title: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '20px', color: '#8B1A1A', marginBottom: '6px' },
  sub: { color: '#5C3D2E', fontSize: '14px', fontStyle: 'italic' },
  error: { background: 'rgba(139,26,26,0.1)', border: '1px solid #8B1A1A', color: '#8B1A1A', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' },
  hint: { background: 'rgba(201,168,76,0.1)', border: '1px dashed #C9A84C', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#5C3D2E', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
};
