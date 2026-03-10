import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { downloadBookingPDF } from '../utils/pdfGenerator';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookedDates, setBookedDates] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tab, setTab] = useState('calendar'); // calendar | bookings

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [datesRes, bookingsRes] = await Promise.all([
        bookingAPI.getBookedDates(),
        bookingAPI.getMyBookings()
      ]);
      setBookedDates(datesRes.data.data || []);
      setMyBookings(bookingsRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const isBooked = (date) => {
    const str = formatDate(date);
    return bookedDates.includes(str);
  };

  const isPast = (date) => date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleDateClick = (date) => {
    if (!date || isPast(date) || isBooked(date)) return;
    setSelectedDate(date);
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  const handleBookSelected = () => {
    if (selectedDate) navigate(`/book/${formatDate(selectedDate)}`);
  };

  const FUNCTION_LABELS = {
    ear_ceremony: 'Ear Ceremony',
    marriage: 'Marriage',
    birthday_party: 'Birthday Party'
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--cream)' }}><div className="spinner" /></div>;

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🪷</span>
          <span style={styles.navTitle}>Sri Rathna Marriage Hall</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button className="btn-secondary" style={{ padding: '7px 16px', fontSize: '12px' }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Welcome Banner */}
        <div style={styles.banner}>
          <div>
            <p style={styles.bannerSub}>Welcome back,</p>
            <h2 style={styles.bannerTitle}>{user?.name}</h2>
          </div>
          <div style={styles.bannerRight}>
            <div style={styles.statBox}><span style={styles.statNum}>{myBookings.length}</span><span style={styles.statLabel}>My Bookings</span></div>
            <div style={styles.statBox}><span style={styles.statNum}>{bookedDates.length}</span><span style={styles.statLabel}>Dates Booked</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'calendar' ? styles.tabActive : {}) }} onClick={() => setTab('calendar')}>📅 Book a Date</button>
          <button style={{ ...styles.tab, ...(tab === 'bookings' ? styles.tabActive : {}) }} onClick={() => setTab('bookings')}>📋 My Bookings</button>
        </div>

        {/* Calendar Tab */}
        {tab === 'calendar' && (
          <div style={styles.calendarSection}>
            <div style={styles.calendarCard}>
              {/* Month Nav */}
              <div style={styles.calNav}>
                <button style={styles.calNavBtn} onClick={handlePrevMonth}>‹</button>
                <h3 style={styles.calTitle}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
                <button style={styles.calNavBtn} onClick={handleNextMonth}>›</button>
              </div>

              {/* Day Headers */}
              <div style={styles.calGrid}>
                {DAYS.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
              </div>

              {/* Dates */}
              <div style={styles.calGrid}>
                {getDaysInMonth().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const booked = isBooked(date);
                  const past = isPast(date);
                  const selected = selectedDate && formatDate(date) === formatDate(selectedDate);
                  const isToday = formatDate(date) === formatDate(today);

                  return (
                    <div
                      key={i}
                      onClick={() => handleDateClick(date)}
                      style={{
                        ...styles.calDay,
                        ...(past ? styles.calPast : {}),
                        ...(booked ? styles.calBooked : {}),
                        ...(!past && !booked ? styles.calAvailable : {}),
                        ...(selected ? styles.calSelected : {}),
                        ...(isToday && !booked ? styles.calToday : {}),
                      }}
                      title={booked ? 'Already booked' : past ? 'Past date' : 'Available'}
                    >
                      {date.getDate()}
                      {booked && <div style={styles.bookedDot} />}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={styles.legend}>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#4CAF50' }} /><span>Available</span></div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#8B1A1A' }} /><span>Booked</span></div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#C9A84C' }} /><span>Selected</span></div>
                <div style={styles.legendItem}><div style={{ ...styles.legendDot, background: '#aaa' }} /><span>Past</span></div>
              </div>
            </div>

            {/* Selection Panel */}
            {selectedDate ? (
              <div style={styles.selectionCard}>
                <div style={styles.selIcon}>✅</div>
                <h3 style={styles.selTitle}>Date Selected!</h3>
                <p style={styles.selDate} className="serif">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="gold-divider" />
                <p style={{ color: '#5C3D2E', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>Proceed to fill your booking details and complete the advance payment of ₹1,000</p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleBookSelected}>
                  Continue Booking →
                </button>
                <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setSelectedDate(null)}>
                  Clear Selection
                </button>
              </div>
            ) : (
              <div style={styles.hintCard}>
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>👆</div>
                <h3 style={{ fontFamily: 'Cinzel Decorative, cursive', fontSize: '14px', color: '#1A0A0A', textAlign: 'center', marginBottom: '10px' }}>Select a Date</h3>
                <p style={{ color: '#5C3D2E', fontSize: '13px', textAlign: 'center', lineHeight: '1.8' }}>Click on any available (green) date on the calendar to begin your booking.</p>
                <div className="gold-divider" />
                <div style={{ fontSize: '13px', color: '#5C3D2E', lineHeight: '2' }}>
                  <div>🎊 <strong>Ear Ceremony</strong> — ₹10,000</div>
                  <div>💍 <strong>Marriage</strong> — ₹20,000</div>
                  <div>🎂 <strong>Birthday Party</strong> — ₹8,000</div>
                  <div style={{ marginTop: '8px', color: '#8B1A1A' }}>💰 Advance: ₹1,000 only</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {tab === 'bookings' && (
          <div style={styles.bookingsSection}>
            {myBookings.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', color: '#1A0A0A', marginBottom: '8px' }}>No Bookings Yet</h3>
                <p style={{ color: '#5C3D2E', fontSize: '14px' }}>Go to the calendar tab and select a date to make your first booking!</p>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setTab('calendar')}>Book a Date</button>
              </div>
            ) : (
              myBookings.map(b => (
                <div key={b.id} style={styles.bookingCard}>
                  <div style={styles.bookingTop}>
                    <div>
                      <h3 style={styles.bookingTitle}>{FUNCTION_LABELS[b.functionType] || b.functionType}</h3>
                      <p style={styles.bookingDate}>📅 {new Date(b.functionDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style={{ ...styles.statusBadge, background: b.bookingStatus === 'confirmed' ? 'rgba(45,106,79,0.1)' : 'rgba(139,26,26,0.1)', color: b.bookingStatus === 'confirmed' ? '#1b4332' : '#8B1A1A', border: `1px solid ${b.bookingStatus === 'confirmed' ? '#52b788' : '#8B1A1A'}` }}>
                      {b.bookingStatus === 'confirmed' ? '✓ Confirmed' : 'Cancelled'}
                    </div>
                  </div>
                  <div className="gold-divider" style={{ margin: '12px 0' }} />
                  <div style={styles.bookingDetails}>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Total</span><span style={styles.detailValue}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</span></div>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Advance Paid</span><span style={{ ...styles.detailValue, color: '#2d6a4f' }}>₹{Number(b.advanceAmount).toLocaleString('en-IN')}</span></div>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Balance Due</span><span style={{ ...styles.detailValue, color: '#8B1A1A', fontWeight: '700' }}>₹{Number(b.remainingAmount).toLocaleString('en-IN')}</span></div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => downloadBookingPDF(b)}>
                    📥 Download Booking PDF
                  </button>
                </div>
              ))
            )}
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
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { color: '#FDF8EE', fontSize: '14px', fontWeight: '600' },

  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },

  banner: { background: 'linear-gradient(135deg, #1A0A0A 0%, #2D1515 100%)', borderRadius: '12px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', border: '1px solid rgba(201,168,76,0.3)', flexWrap: 'wrap', gap: '16px' },
  bannerSub: { color: 'rgba(253,248,238,0.6)', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' },
  bannerTitle: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginTop: '4px' },
  bannerRight: { display: 'flex', gap: '20px' },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', padding: '12px 20px', minWidth: '80px' },
  statNum: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: '24px', fontWeight: '900' },
  statLabel: { color: 'rgba(253,248,238,0.6)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' },

  tabs: { display: 'flex', gap: '4px', background: 'white', padding: '6px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  tab: { flex: 1, padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontFamily: 'Nunito', fontWeight: '600', fontSize: '14px', color: '#5C3D2E', transition: 'all 0.3s' },
  tabActive: { background: 'linear-gradient(135deg, #1A0A0A, #2D1515)', color: '#C9A84C' },

  calendarSection: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' },
  calendarCard: { background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  calNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  calNavBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #C9A84C', background: 'transparent', color: '#C9A84C', fontSize: '20px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  calTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '15px', color: '#1A0A0A' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' },
  dayHeader: { textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#8B1A1A', padding: '6px 0', letterSpacing: '0.5px' },
  calDay: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  calAvailable: { background: 'rgba(76,175,80,0.1)', color: '#1b4332', border: '1px solid rgba(76,175,80,0.3)', cursor: 'pointer' },
  calBooked: { background: 'rgba(139,26,26,0.1)', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.2)', cursor: 'not-allowed' },
  calPast: { background: '#f5f5f5', color: '#bbb', cursor: 'not-allowed' },
  calSelected: { background: 'linear-gradient(135deg, #C9A84C, #9A7832) !important', color: 'white !important', border: '2px solid #C9A84C', boxShadow: '0 4px 12px rgba(201,168,76,0.4)' },
  calToday: { border: '2px solid #C9A84C' },
  bookedDot: { width: '4px', height: '4px', borderRadius: '50%', background: '#8B1A1A', position: 'absolute', bottom: '4px' },
  legend: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5C3D2E' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%' },

  selectionCard: { background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #C9A84C' },
  selIcon: { fontSize: '36px', textAlign: 'center', marginBottom: '10px' },
  selTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', color: '#1A0A0A', textAlign: 'center', marginBottom: '8px' },
  selDate: { color: '#8B1A1A', fontSize: '16px', fontStyle: 'italic', textAlign: 'center', fontWeight: '600', marginBottom: '8px' },

  hintCard: { background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },

  bookingsSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  bookingCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)' },
  bookingTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
  bookingTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', color: '#1A0A0A', marginBottom: '6px' },
  bookingDate: { color: '#5C3D2E', fontSize: '14px' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  bookingDetails: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--cream)', padding: '10px 14px', borderRadius: '8px' },
  detailLabel: { fontSize: '11px', color: '#5C3D2E', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' },
  detailValue: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A' },

  emptyState: { background: 'white', borderRadius: '12px', padding: '60px 32px', textAlign: 'center', border: '1px solid rgba(201,168,76,0.2)' },
};
