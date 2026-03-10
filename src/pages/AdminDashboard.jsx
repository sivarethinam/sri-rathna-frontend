import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { downloadBookingPDF } from '../utils/pdfGenerator';

const FUNCTION_LABELS = {
  ear_ceremony: 'Ear Ceremony',
  marriage: 'Marriage',
  birthday_party: 'Birthday Party'
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [viewDate, setViewDate] = useState(new Date());
  const [today] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({ customerName: '', mobile: '', email: '', address: '', functionType: '', paymentReference: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const [newBooking, setNewBooking] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [allRes, datesRes] = await Promise.all([bookingAPI.getAllBookings(), bookingAPI.getBookedDates()]);
      setBookings(allRes.data.data || []);
      setBookedDates(datesRes.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatDate = d => {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  const isBooked = d => bookedDates.includes(formatDate(d));
  const isPast = d => d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDaysInMonth = () => {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay(), daysCount = new Date(y, m + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(y, m, i));
    return days;
  };

  const handleDateClick = d => {
    if (!d || isPast(d) || isBooked(d)) return;
    setSelectedDate(d);
    setShowBookingForm(true);
    setFormMsg(null);
    setBookingForm({ customerName: '', mobile: '', email: '', address: '', functionType: '', paymentReference: '' });
  };

  const handleAdminBook = async e => {
    e.preventDefault();
    if (!bookingForm.functionType) return setFormMsg({ type: 'error', text: 'Select function type' });
    setFormLoading(true); setFormMsg(null);
    try {
      const res = await bookingAPI.createBooking({ ...bookingForm, functionDate: formatDate(selectedDate) });
      if (res.data.success) {
        setNewBooking(res.data.data);
        setFormMsg({ type: 'success', text: 'Booking confirmed!' });
        await fetchData();
        setShowBookingForm(false);
      } else {
        setFormMsg({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Booking failed' });
    }
    setFormLoading(false);
  };

  const totalRevenue = bookings.filter(b => b.bookingStatus === 'confirmed').reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const totalAdvance = bookings.filter(b => b.bookingStatus === 'confirmed').reduce((sum, b) => sum + Number(b.advanceAmount), 0);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🛡️</span>
          <span style={styles.navTitle}>Admin Panel — Sri Rathna Marriage Hall</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#C9A84C', fontSize: '13px' }}>👤 {user?.name}</span>
          <button className="btn-secondary" style={{ padding: '7px 16px', fontSize: '12px' }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Bookings', value: bookings.length, icon: '📋', color: '#C9A84C' },
            { label: 'Confirmed', value: bookings.filter(b => b.bookingStatus === 'confirmed').length, icon: '✅', color: '#52b788' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#C9A84C' },
            { label: 'Advance Collected', value: `₹${totalAdvance.toLocaleString('en-IN')}`, icon: '💵', color: '#52b788' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
              <div style={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'calendar', 'bookings'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
              {t === 'overview' ? '📊 Overview' : t === 'calendar' ? '📅 Book for Customer' : '📋 All Bookings'}
            </button>
          ))}
        </div>

        {/* New booking success */}
        {newBooking && (
          <div style={{ background: 'rgba(45,106,79,0.1)', border: '1px solid #52b788', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ color: '#1b4332', fontWeight: '600', fontSize: '14px' }}>✅ Booking confirmed for {newBooking.customerName} on {new Date(newBooking.functionDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }} onClick={() => { downloadBookingPDF(newBooking); setNewBooking(null); }}>📥 Download PDF</button>
          </div>
        )}

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <h3 style={styles.sectionHead}>Recent Bookings</h3>
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} style={styles.bookingRow}>
                <div style={styles.bookingRowLeft}>
                  <div style={styles.bookingRowTitle}>{b.customerName}</div>
                  <div style={styles.bookingRowSub}>{b.mobile} • {FUNCTION_LABELS[b.functionType]}</div>
                </div>
                <div style={styles.bookingRowMid} className="serif">
                  {new Date(b.functionDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={styles.bookingRowRight}>
                  <span style={{ color: '#C9A84C', fontWeight: '700' }}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</span>
                  <span style={{ ...styles.badge, background: b.bookingStatus === 'confirmed' ? 'rgba(45,106,79,0.1)' : 'rgba(139,26,26,0.1)', color: b.bookingStatus === 'confirmed' ? '#1b4332' : '#8B1A1A', border: `1px solid ${b.bookingStatus === 'confirmed' ? '#52b788' : '#8B1A1A'}` }}>
                    {b.bookingStatus === 'confirmed' ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <div style={styles.empty}>No bookings yet</div>}
          </div>
        )}

        {/* Admin Calendar Tab */}
        {tab === 'calendar' && (
          <div style={styles.calSection}>
            <div style={styles.calCard}>
              <div style={styles.calNav}>
                <button style={styles.calBtn} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>‹</button>
                <h3 style={styles.calTitle}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
                <button style={styles.calBtn} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>›</button>
              </div>
              <div style={styles.calGrid}>
                {DAYS.map(d => <div key={d} style={styles.dayHdr}>{d}</div>)}
              </div>
              <div style={styles.calGrid}>
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`e-${i}`} />;
                  const booked = isBooked(date), past = isPast(date);
                  const selected = selectedDate && formatDate(date) === formatDate(selectedDate);
                  return (
                    <div key={i} onClick={() => handleDateClick(date)} style={{ ...styles.calDay, ...(past ? styles.calPast : booked ? styles.calBooked : styles.calAvail), ...(selected ? styles.calSel : {}) }}>
                      {date.getDate()}
                      {booked && <div style={styles.bDot} />}
                    </div>
                  );
                })}
              </div>
              <div style={styles.legend}>
                {[['#4CAF50','Available'],['#8B1A1A','Booked'],['#C9A84C','Selected'],['#aaa','Past']].map(([c,l]) => (
                  <div key={l} style={styles.legendItem}><div style={{ ...styles.legendDot, background: c }} /><span>{l}</span></div>
                ))}
              </div>
            </div>

            {showBookingForm && selectedDate && (
              <div style={styles.bookFormCard}>
                <h3 style={styles.formTitle}>Book for Customer</h3>
                <p style={{ color: '#5C3D2E', fontSize: '13px', fontStyle: 'italic', marginBottom: '16px' }} className="serif">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {formMsg && <div style={{ padding: '10px', borderRadius: '6px', background: formMsg.type === 'success' ? 'rgba(45,106,79,0.1)' : 'rgba(139,26,26,0.1)', color: formMsg.type === 'success' ? '#1b4332' : '#8B1A1A', fontSize: '13px', fontWeight: '600', marginBottom: '12px', border: `1px solid ${formMsg.type === 'success' ? '#52b788' : '#8B1A1A'}` }}>{formMsg.text}</div>}
                <form onSubmit={handleAdminBook} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label>Customer Name *</label><input value={bookingForm.customerName} onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})} placeholder="Full name" required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label>Mobile *</label><input value={bookingForm.mobile} onChange={e => setBookingForm({...bookingForm, mobile: e.target.value})} placeholder="Mobile number" required /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label>Function Type *</label>
                    <select value={bookingForm.functionType} onChange={e => setBookingForm({...bookingForm, functionType: e.target.value})} required>
                      <option value="">Select function...</option>
                      <option value="ear_ceremony">Ear Ceremony — ₹10,000</option>
                      <option value="marriage">Marriage — ₹20,000</option>
                      <option value="birthday_party">Birthday Party — ₹8,000</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label>Email</label><input value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} placeholder="Email (optional)" /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label>Payment Ref</label><input value={bookingForm.paymentReference} onChange={e => setBookingForm({...bookingForm, paymentReference: e.target.value})} placeholder="Payment reference (optional)" /></div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={formLoading}>
                    {formLoading ? 'Booking...' : '✅ Confirm Booking'}
                  </button>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => { setShowBookingForm(false); setSelectedDate(null); }}>Cancel</button>
                </form>
              </div>
            )}

            {!showBookingForm && (
              <div style={{ ...styles.bookFormCard, textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                <h3 style={{ fontFamily: 'Cinzel Decorative, cursive', fontSize: '14px', color: '#1A0A0A', marginBottom: '10px' }}>Admin Booking</h3>
                <p style={{ color: '#5C3D2E', fontSize: '13px', lineHeight: '1.8' }}>Select any available date on the calendar to create an offline booking for a customer.</p>
              </div>
            )}
          </div>
        )}

        {/* All Bookings Tab */}
        {tab === 'bookings' && (
          <div>
            <h3 style={styles.sectionHead}>All Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? <div style={styles.empty}>No bookings found</div> : bookings.map(b => (
              <div key={b.id} style={styles.fullBookingCard}>
                <div style={styles.fullBookingTop}>
                  <div>
                    <h4 style={{ fontFamily: 'Cinzel Decorative, cursive', fontSize: '14px', color: '#1A0A0A', marginBottom: '4px' }}>{b.customerName}</h4>
                    <p style={{ color: '#5C3D2E', fontSize: '13px' }}>{b.mobile} {b.email ? `• ${b.email}` : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {b.bookedByAdmin && <span style={styles.adminTag}>Admin Booking</span>}
                    <span style={{ ...styles.badge, background: b.bookingStatus === 'confirmed' ? 'rgba(45,106,79,0.1)' : 'rgba(139,26,26,0.1)', color: b.bookingStatus === 'confirmed' ? '#1b4332' : '#8B1A1A', border: `1px solid ${b.bookingStatus === 'confirmed' ? '#52b788' : '#8B1A1A'}` }}>
                      {b.bookingStatus === 'confirmed' ? '✓ Confirmed' : '✗ Cancelled'}
                    </span>
                  </div>
                </div>
                <div style={styles.fullBookingGrid}>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Function</span><span>{FUNCTION_LABELS[b.functionType]}</span></div>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Date</span><span className="serif">{new Date(b.functionDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Total</span><span style={{ color: '#C9A84C', fontWeight: '700' }}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</span></div>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Advance</span><span style={{ color: '#2d6a4f', fontWeight: '700' }}>₹{Number(b.advanceAmount).toLocaleString('en-IN')}</span></div>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Balance</span><span style={{ color: '#8B1A1A', fontWeight: '700' }}>₹{Number(b.remainingAmount).toLocaleString('en-IN')}</span></div>
                  <div style={styles.gridItem}><span style={styles.gridLabel}>Payment Ref</span><span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{b.paymentReference || 'N/A'}</span></div>
                </div>
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 16px', marginTop: '12px' }} onClick={() => downloadBookingPDF(b)}>📥 Download PDF</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  nav: { background: '#0D0505', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #8B1A1A', position: 'sticky', top: 0, zIndex: 100 },
  navTitle: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: '14px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#1A0A0A', borderRadius: '10px', padding: '24px', border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center' },
  statVal: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '22px', fontWeight: '900', marginBottom: '4px' },
  statLbl: { color: 'rgba(253,248,238,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' },

  tabs: { display: 'flex', gap: '4px', background: 'white', padding: '6px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  tab: { flex: 1, padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontFamily: 'Nunito', fontWeight: '600', fontSize: '13px', color: '#5C3D2E', transition: 'all 0.3s' },
  tabActive: { background: 'linear-gradient(135deg, #1A0A0A, #2D1515)', color: '#C9A84C' },

  sectionHead: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', color: '#1A0A0A', marginBottom: '16px' },
  bookingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '10px', border: '1px solid rgba(201,168,76,0.15)', gap: '16px', flexWrap: 'wrap' },
  bookingRowLeft: { flex: 1, minWidth: '150px' },
  bookingRowTitle: { fontWeight: '700', color: '#1A0A0A', fontSize: '14px', marginBottom: '4px' },
  bookingRowSub: { color: '#5C3D2E', fontSize: '12px' },
  bookingRowMid: { color: '#8B1A1A', fontSize: '14px', fontStyle: 'italic' },
  bookingRowRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },
  adminTag: { background: 'rgba(139,26,26,0.1)', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.3)', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#5C3D2E', padding: '40px', background: 'white', borderRadius: '8px' },

  calSection: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' },
  calCard: { background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  calNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  calBtn: { width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid #C9A84C', background: 'transparent', color: '#C9A84C', fontSize: '20px', cursor: 'pointer', fontWeight: '700' },
  calTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '14px', color: '#1A0A0A' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' },
  dayHdr: { textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#8B1A1A', padding: '6px 0' },
  calDay: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  calAvail: { background: 'rgba(76,175,80,0.1)', color: '#1b4332', border: '1px solid rgba(76,175,80,0.3)' },
  calBooked: { background: 'rgba(139,26,26,0.1)', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.2)', cursor: 'not-allowed' },
  calPast: { background: '#f5f5f5', color: '#bbb', cursor: 'not-allowed' },
  calSel: { background: 'linear-gradient(135deg, #C9A84C, #9A7832)', color: 'white', border: '2px solid #C9A84C', boxShadow: '0 4px 12px rgba(201,168,76,0.4)' },
  bDot: { width: '4px', height: '4px', borderRadius: '50%', background: '#8B1A1A', position: 'absolute', bottom: '4px' },
  legend: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5C3D2E' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%' },

  bookFormCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid rgba(201,168,76,0.3)' },
  formTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '15px', color: '#1A0A0A', marginBottom: '4px' },

  fullBookingCard: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '12px', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  fullBookingTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' },
  fullBookingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', background: 'var(--cream)', padding: '12px', borderRadius: '8px' },
  gridItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
  gridLabel: { fontSize: '10px', color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' },
};
