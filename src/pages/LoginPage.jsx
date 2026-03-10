import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('register'); // register | otp
  const [form, setForm] = useState({ name: '', mobile: '', email: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [otpDisplay, setOtpDisplay] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async e => {
    e.preventDefault();
    if (!form.mobile || form.mobile.length < 10) return setMessage({ type: 'error', text: 'Enter a valid 10-digit mobile number' });
    setLoading(true);
    setMessage(null);
    try {
      const res = await authAPI.sendOtp(form.mobile, form.name, form.email);
      if (res.data.success) {
        setStep('otp');
        // Show OTP in demo mode
        const otpMatch = res.data.data?.match(/OTP: (\d{6})/);
        if (otpMatch) setOtpDisplay(otpMatch[1]);
        setMessage({ type: 'success', text: `OTP sent to ${form.mobile}` });
      } else {
        setMessage({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP. Check if backend is running.' });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setMessage({ type: 'error', text: 'Enter the 6-digit OTP' });
    setLoading(true);
    setMessage(null);
    try {
      const res = await authAPI.verifyOtp(form.mobile, otp);
      if (res.data.success) {
        const data = res.data.data;
        login({ name: data.name, mobile: data.mobile, role: data.role, userId: data.userId }, data.token);
        navigate('/dashboard');
      } else {
        setMessage({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'OTP verification failed' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🪷</div>
          <h2 style={styles.title}>Sri Rathna<br />Marriage Hall</h2>
          <p style={styles.subtitle} className="serif">
            {step === 'register' ? 'Register or Login to continue' : `Verify your mobile: ${form.mobile}`}
          </p>
        </div>

        <div className="gold-divider" />

        {/* Message */}
        {message && (
          <div style={{ ...styles.msg, background: message.type === 'success' ? 'rgba(45,106,79,0.1)' : 'rgba(139,26,26,0.1)', borderColor: message.type === 'success' ? '#52b788' : '#8B1A1A', color: message.type === 'success' ? '#1b4332' : '#8B1A1A' }}>
            {message.text}
          </div>
        )}

        {/* Demo OTP display */}
        {otpDisplay && step === 'otp' && (
          <div style={styles.otpDemo}>
            <span style={{ fontSize: '12px', color: '#5C3D2E', fontWeight: '600' }}>📱 Demo OTP (remove in production):</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#8B1A1A', letterSpacing: '4px' }}>{otpDisplay}</span>
          </div>
        )}

        {/* Step 1: Register */}
        {step === 'register' && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <div style={styles.field}>
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
            </div>
            <div style={styles.field}>
              <label>Mobile Number *</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} pattern="[0-9]{10}" required />
            </div>
            <div style={styles.field}>
              <label>Email (Optional)</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" type="email" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.field}>
              <label>Enter 6-Digit OTP</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="______" maxLength={6} pattern="[0-9]{6}" style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: '700' }} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => { setStep('register'); setOtp(''); setOtpDisplay(''); setMessage(null); }}>
              ← Change Mobile
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span style={{ color: '#5C3D2E', fontSize: '13px' }}>Are you admin? </span>
          <span style={{ color: '#8B1A1A', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }} onClick={() => navigate('/admin-login')}>Admin Login →</span>
        </div>
        <div style={styles.footer}>
          <span style={{ color: '#5C3D2E', fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate('/')}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A0A0A 0%, #2D1515 50%, #1A0A0A 100%)', padding: '20px' },
  card: { background: 'var(--cream)', borderRadius: '12px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.3)' },
  header: { textAlign: 'center', marginBottom: '24px' },
  logo: { fontSize: '40px', marginBottom: '10px' },
  title: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '18px', color: '#1A0A0A', lineHeight: '1.4', marginBottom: '8px' },
  subtitle: { color: '#5C3D2E', fontSize: '15px', fontStyle: 'italic' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  msg: { padding: '12px 16px', borderRadius: '6px', border: '1px solid', fontSize: '13px', fontWeight: '600', marginBottom: '8px' },
  otpDemo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(201,168,76,0.1)', border: '1px dashed #C9A84C', borderRadius: '8px', padding: '12px', marginBottom: '16px' },
  footer: { textAlign: 'center', marginTop: '16px' },
};
