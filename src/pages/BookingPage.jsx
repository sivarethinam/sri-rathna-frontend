import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { downloadBookingPDF } from '../utils/pdfGenerator';

const FUNCTIONS = [
  { key: 'ear_ceremony', label: 'Ear Ceremony (Karnavedha)', icon: '👂', price: 10000 },
  { key: 'marriage', label: 'Marriage / Wedding', icon: '💍', price: 20000 },
  { key: 'birthday_party', label: 'Birthday Party', icon: '🎂', price: 8000 },
];
const ADVANCE = 1000;

export default function BookingPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: details, 2: function, 3: payment, 4: success
  const [form, setForm] = useState({ customerName: user?.name || '', mobile: user?.mobile || '', email: '', address: '' });
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  const selectedFn = FUNCTIONS.find(f => f.key === selectedFunction);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStep1 = e => {
    e.preventDefault();
    if (!form.customerName || !form.mobile) return setError('Name and mobile are required');
    setError('');
    setStep(2);
  };

  const handleStep2 = () => {
    if (!selectedFunction) return setError('Please select a function type');
    setError('');
    setStep(3);
  };

  const handlePayment = async () => {
    if (!paymentRef.trim()) return setError('Enter payment transaction reference');
    setLoading(true);
    setError('');
    try {
      const res = await bookingAPI.createBooking({
        customerName: form.customerName,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        functionDate: date,
        functionType: selectedFunction,
        paymentReference: paymentRef,
      });
      if (res.data.success) {
        setBooking(res.data.data);
        setStep(4);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  };

  const displayDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🪷</span>
          <span style={styles.navTitle}>Sri Rathna Marriage Hall</span>
        </div>
        <button className="btn-secondary" style={{ padding: '7px 16px', fontSize: '12px' }} onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </nav>

      <div style={styles.container}>
        {/* Progress */}
        {step < 4 && (
          <div style={styles.progress}>
            {['Details', 'Function', 'Payment'].map((label, i) => (
              <div key={i} style={styles.progressItem}>
                <div style={{ ...styles.progressDot, background: step > i ? '#C9A84C' : step === i + 1 ? '#8B1A1A' : '#ddd', color: step >= i + 1 ? 'white' : '#999' }}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ ...styles.progressLabel, color: step >= i + 1 ? '#1A0A0A' : '#999', fontWeight: step === i + 1 ? '700' : '400' }}>{label}</span>
                {i < 2 && <div style={{ ...styles.progressLine, background: step > i + 1 ? '#C9A84C' : '#ddd' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Date Banner */}
        {step < 4 && (
          <div style={styles.dateBanner}>
            <span style={styles.dateBannerIcon}>📅</span>
            <div>
              <p style={styles.dateBannerSub}>Selected Date</p>
              <p style={styles.dateBannerDate} className="serif">{displayDate}</p>
            </div>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1: Customer Details */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Customer Details</h2>
            <div className="gold-divider" />
            <form onSubmit={handleStep1} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label>Full Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Customer full name" required />
                </div>
                <div style={styles.field}>
                  <label>Mobile Number *</label>
                  <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label>Email (Optional)</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" type="email" />
                </div>
                <div style={styles.field}>
                  <label>Address (Optional)</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Your address" />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', padding: '12px 36px' }}>
                Next: Select Function →
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Function Type */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Select Function Type</h2>
            <div className="gold-divider" />
            <div style={styles.functionGrid}>
              {FUNCTIONS.map(fn => (
                <div
                  key={fn.key}
                  onClick={() => setSelectedFunction(fn.key)}
                  style={{ ...styles.functionCard, ...(selectedFunction === fn.key ? styles.functionSelected : {}) }}
                >
                  <div style={styles.fnIcon}>{fn.icon}</div>
                  <h3 style={styles.fnName}>{fn.label}</h3>
                  <div style={styles.fnPrice}>₹{fn.price.toLocaleString('en-IN')}</div>
                  <div style={styles.fnAdvance}>+ ₹{ADVANCE.toLocaleString('en-IN')} advance</div>
                  {selectedFunction === fn.key && <div style={styles.selectedCheck}>✓ Selected</div>}
                </div>
              ))}
            </div>
            {selectedFn && (
              <div style={styles.priceSummary}>
                <div style={styles.priceRow}><span>Total Rent</span><span>₹{selectedFn.price.toLocaleString('en-IN')}</span></div>
                <div style={styles.priceRow}><span>Advance to Pay Now</span><span style={{ color: '#2d6a4f', fontWeight: '700' }}>₹{ADVANCE.toLocaleString('en-IN')}</span></div>
                <div style={{ ...styles.priceRow, borderTop: '1px solid rgba(201,168,76,0.3)', paddingTop: '10px', marginTop: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#8B1A1A' }}>Balance on Function Day</span>
                  <span style={{ fontWeight: '700', color: '#8B1A1A', fontSize: '18px' }}>₹{(selectedFn.price - ADVANCE).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={handleStep2}>Next: Payment →</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && selectedFn && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Advance Payment</h2>
            <div className="gold-divider" />
            <div style={styles.paymentBox}>
              <p style={styles.payLabel}>Amount to Pay</p>
              <p style={styles.payAmount}>₹1,000</p>
              <p style={styles.payNote}>Advance booking amount (non-refundable)</p>
            </div>
            <div style={styles.paymentInfo}>
              <div style={styles.infoRow}><span>Function</span><span>{selectedFn.label}</span></div>
              <div style={styles.infoRow}><span>Date</span><span className="serif">{displayDate}</span></div>
              <div style={styles.infoRow}><span>Customer</span><span>{form.customerName}</span></div>
              <div style={styles.infoRow}><span>Mobile</span><span>{form.mobile}</span></div>
            </div>
            <div style={styles.razorpaySection}>
              <p style={styles.razorpayTitle}>🔐 Complete Payment via Razorpay</p>
              <p style={styles.razorpayNote}>Pay ₹1,000 advance using Razorpay and enter your transaction reference below:</p>
              <div style={styles.field}>
                <label>Transaction / Payment Reference *</label>
                <input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Enter Razorpay transaction ID (e.g. pay_XXXXXXXXXX)" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" onClick={handlePayment} disabled={loading}>
                {loading ? 'Confirming Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && booking && (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.successTitle}>Booking Confirmed!</h2>
            <p style={styles.successSub} className="serif">Your booking has been successfully registered</p>
            <div className="gold-divider" />
            <div style={styles.successDetails}>
              <div style={styles.successRow}><span>Booking ID</span><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{booking.id}</span></div>
              <div style={styles.successRow}><span>Customer Name</span><span>{booking.customerName}</span></div>
              <div style={styles.successRow}><span>Function Date</span><span className="serif" style={{ color: '#8B1A1A' }}>{new Date(booking.functionDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div style={styles.successRow}><span>Function Type</span><span>{FUNCTIONS.find(f => f.key === booking.functionType)?.label}</span></div>
              <div style={styles.successRow}><span>Total Amount</span><span>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</span></div>
              <div style={styles.successRow}><span>Advance Paid</span><span style={{ color: '#2d6a4f', fontWeight: '700' }}>₹{Number(booking.advanceAmount).toLocaleString('en-IN')}</span></div>
              <div style={{ ...styles.successRow, background: 'rgba(139,26,26,0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(139,26,26,0.2)' }}>
                <span style={{ fontWeight: '700', color: '#8B1A1A' }}>Balance Due on Event Day</span>
                <span style={{ fontWeight: '900', color: '#8B1A1A', fontSize: '18px' }}>₹{Number(booking.remainingAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
              <button className="btn-primary" style={{ width: '100%', fontSize: '15px', padding: '14px' }} onClick={() => downloadBookingPDF(booking)}>
                📥 Download Booking PDF
              </button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  nav: { background: '#1A0A0A', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #C9A84C', position: 'sticky', top: 0, zIndex: 100 },
  navTitle: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: '15px' },

  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },

  progress: { display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' },
  progressItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  progressDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', transition: 'all 0.3s' },
  progressLabel: { fontSize: '13px', transition: 'color 0.3s' },
  progressLine: { width: '40px', height: '2px', margin: '0 4px', transition: 'background 0.3s' },

  dateBanner: { display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #1A0A0A, #2D1515)', borderRadius: '10px', padding: '16px 24px', marginBottom: '20px', border: '1px solid rgba(201,168,76,0.3)' },
  dateBannerIcon: { fontSize: '28px' },
  dateBannerSub: { color: 'rgba(253,248,238,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' },
  dateBannerDate: { color: '#C9A84C', fontSize: '18px', fontStyle: 'italic', fontWeight: '600', marginTop: '2px' },

  error: { background: 'rgba(139,26,26,0.1)', border: '1px solid #8B1A1A', color: '#8B1A1A', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },

  card: { background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  cardTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '18px', color: '#1A0A0A', marginBottom: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },

  functionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' },
  functionCard: { border: '2px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', background: 'var(--cream)' },
  functionSelected: { border: '2px solid #C9A84C', background: 'rgba(201,168,76,0.05)', boxShadow: '0 4px 16px rgba(201,168,76,0.2)' },
  fnIcon: { fontSize: '36px', marginBottom: '10px' },
  fnName: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '12px', color: '#1A0A0A', marginBottom: '10px', lineHeight: '1.4' },
  fnPrice: { fontSize: '22px', fontWeight: '900', color: '#8B1A1A', fontFamily: 'Cinzel Decorative, cursive' },
  fnAdvance: { fontSize: '11px', color: '#5C3D2E', marginTop: '4px' },
  selectedCheck: { position: 'absolute', top: '8px', right: '8px', background: '#C9A84C', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' },

  priceSummary: { background: 'var(--cream)', borderRadius: '8px', padding: '16px 20px', marginTop: '20px', border: '1px solid rgba(201,168,76,0.3)' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '14px', color: '#5C3D2E' },

  paymentBox: { background: 'linear-gradient(135deg, #1A0A0A, #2D1515)', borderRadius: '10px', padding: '28px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(201,168,76,0.3)' },
  payLabel: { color: 'rgba(253,248,238,0.6)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  payAmount: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: '48px', fontWeight: '900', marginBottom: '6px' },
  payNote: { color: 'rgba(253,248,238,0.5)', fontSize: '13px' },

  paymentInfo: { background: 'var(--cream)', borderRadius: '8px', padding: '16px 20px', border: '1px solid rgba(201,168,76,0.2)', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid rgba(201,168,76,0.1)', color: '#5C3D2E' },

  razorpaySection: { background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', padding: '20px' },
  razorpayTitle: { fontWeight: '700', color: '#1A0A0A', fontSize: '14px', marginBottom: '6px' },
  razorpayNote: { color: '#5C3D2E', fontSize: '13px', marginBottom: '14px', lineHeight: '1.6' },

  successCard: { background: 'white', borderRadius: '16px', padding: '40px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '2px solid #C9A84C', textAlign: 'center' },
  successIcon: { fontSize: '60px', marginBottom: '16px' },
  successTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '24px', color: '#1A0A0A', marginBottom: '8px' },
  successSub: { color: '#5C3D2E', fontSize: '16px', fontStyle: 'italic', marginBottom: '16px' },
  successDetails: { background: 'var(--cream)', borderRadius: '10px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' },
  successRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#5C3D2E', gap: '12px', flexWrap: 'wrap' },
};
