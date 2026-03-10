import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hall1 from '../assets/hall1.jpg';
import hall2 from '../assets/hall2.png';
import hall3 from '../assets/hall3.png';
import hall4 from '../assets/hall4.png';

const slides = [hall1, hall2, hall3, hall4];
const slideCaptions = [
  'Grand Entrance Celebrations',
  'Majestic Hall Architecture',
  'Elegant Banquet Interior',
  'Spacious Dining Area'
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setFadeIn(true);
      }, 600);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navIcon}>🪷</span>
          <span style={styles.navTitle}>Sri Rathna Marriage Hall</span>
        </div>
        <div style={styles.navBtns}>
          <button style={styles.navBtn} onClick={() => navigate('/login')}>Customer Login</button>
          <button style={styles.adminBtn} onClick={() => navigate('/admin-login')}>Admin Login</button>
        </div>
      </nav>

      {/* Hero Slider */}
      <div style={styles.heroSection}>
        <div style={{ ...styles.heroImg, opacity: fadeIn ? 1 : 0 }}>
          <img src={slides[currentSlide]} alt={slideCaptions[currentSlide]} style={styles.img} />
          <div style={styles.heroOverlay} />
        </div>

        <div style={styles.heroContent}>
          <p style={styles.heroSub}>✦ Welcome to ✦</p>
          <h1 style={styles.heroTitle}>Sri Rathna<br />Marriage Hall</h1>
          <p style={styles.heroCap} className="serif">{slideCaptions[currentSlide]}</p>
          <div style={styles.heroBtns}>
            <button className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px' }} onClick={() => navigate('/login')}>
              Book Your Date
            </button>
            <button className="btn-secondary" style={{ fontSize: '14px', padding: '12px 28px', borderColor: '#C9A84C', color: '#C9A84C' }} onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>
              Explore Hall
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setCurrentSlide(i)} style={{ ...styles.dot, background: i === currentSlide ? '#C9A84C' : 'rgba(255,255,255,0.4)', transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)' }} />
          ))}
        </div>
      </div>

      {/* Ornament divider */}
      <div style={styles.ornamentBar}>
        <span style={styles.ornamentText}>❋ &nbsp; Sri Rathna Marriage Hall &nbsp; ❋</span>
      </div>

      {/* About Section */}
      <section id="about" style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>About Our Hall</p>
          <h2 style={styles.sectionTitle}>A Venue Worthy of<br />Your Celebration</h2>
          <div className="gold-divider" style={{ maxWidth: '200px', margin: '16px auto' }} />
        </div>
        <div style={styles.aboutGrid}>
          <div style={styles.aboutCard}>
            <div style={styles.aboutIcon}>🎊</div>
            <h3 style={styles.aboutCardTitle}>Grand Hall</h3>
            <p style={styles.aboutCardText}>Spacious air-conditioned hall with golden chandeliers, perfect for all celebrations from intimate gatherings to grand weddings.</p>
          </div>
          <div style={styles.aboutCard}>
            <div style={styles.aboutIcon}>🍽️</div>
            <h3 style={styles.aboutCardTitle}>Dining Area</h3>
            <p style={styles.aboutCardText}>Well-equipped banquet dining area with long counters, capable of hosting large numbers of guests in comfort and style.</p>
          </div>
          <div style={styles.aboutCard}>
            <div style={styles.aboutIcon}>📍</div>
            <h3 style={styles.aboutCardTitle}>Prime Location</h3>
            <p style={styles.aboutCardText}>Conveniently located and easily accessible, making it an ideal venue for families and guests travelling from all areas.</p>
          </div>
        </div>
      </section>

      {/* Functions & Pricing */}
      <section style={{ ...styles.section, background: 'linear-gradient(135deg, #1A0A0A 0%, #2D1515 100%)' }}>
        <div style={styles.sectionHeader}>
          <p style={{ ...styles.sectionLabel, color: '#C9A84C' }}>Our Packages</p>
          <h2 style={{ ...styles.sectionTitle, color: '#FDF8EE' }}>Functions & Pricing</h2>
          <div className="gold-divider" style={{ maxWidth: '200px', margin: '16px auto' }} />
        </div>
        <div style={styles.pricingGrid}>
          {[
            { icon: '👂', name: 'Ear Ceremony', sub: 'Karnavedha', price: '₹10,000', advance: '₹1,000 advance', color: '#C9A84C' },
            { icon: '💍', name: 'Marriage', sub: 'Wedding Ceremony', price: '₹20,000', advance: '₹1,000 advance', color: '#8B1A1A', featured: true },
            { icon: '🎂', name: 'Birthday Party', sub: 'Celebration Event', price: '₹8,000', advance: '₹1,000 advance', color: '#C9A84C' },
          ].map((pkg, i) => (
            <div key={i} style={{ ...styles.pricingCard, transform: pkg.featured ? 'scale(1.06)' : 'scale(1)', border: pkg.featured ? '2px solid #C9A84C' : '1px solid rgba(201,168,76,0.2)' }}>
              {pkg.featured && <div style={styles.popularBadge}>Most Popular</div>}
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{pkg.icon}</div>
              <h3 style={{ ...styles.pkgName, color: pkg.featured ? '#C9A84C' : '#FDF8EE' }}>{pkg.name}</h3>
              <p style={styles.pkgSub}>{pkg.sub}</p>
              <div style={styles.pkgPrice}>{pkg.price}</div>
              <p style={styles.pkgAdvance}>{pkg.advance}</p>
              <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={() => navigate('/login')}>
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>Our Gallery</p>
          <h2 style={styles.sectionTitle}>Experience the<br />Grandeur</h2>
          <div className="gold-divider" style={{ maxWidth: '160px', margin: '16px auto' }} />
        </div>
        <div style={styles.galleryGrid}>
          {slides.map((img, i) => (
            <div key={i} style={styles.galleryItem}>
              <img src={img} alt={slideCaptions[i]} style={styles.galleryImg} />
              <div style={styles.galleryOverlay}>
                <span style={styles.galleryCaption}>{slideCaptions[i]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaOrnament}>✦ ✦ ✦</div>
        <h2 style={styles.ctaTitle}>Ready to Book Your Date?</h2>
        <p style={styles.ctaText} className="serif">Create your account today and check real-time availability of our hall for your special function.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
          <button className="btn-primary" style={{ fontSize: '15px', padding: '14px 40px' }} onClick={() => navigate('/login')}>
            Register & Book Now
          </button>
          <button className="btn-secondary" style={{ fontSize: '14px', padding: '12px 32px' }} onClick={() => navigate('/admin-login')}>
            Admin Login
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <span style={{ fontSize: '20px' }}>🪷</span>
          <span style={styles.footerName}>Sri Rathna Marriage Hall</span>
        </div>
        <div className="gold-divider" style={{ maxWidth: '300px', margin: '16px auto' }} />
        <p style={styles.footerText}>© 2024 Sri Rathna Marriage Hall. All rights reserved.</p>
        <p style={styles.footerText}>Making every celebration memorable.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--cream)' },

  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px',
    background: 'rgba(26,10,10,0.92)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(201,168,76,0.3)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navIcon: { fontSize: '24px' },
  navTitle: { color: '#C9A84C', fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', fontWeight: '700' },
  navBtns: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    background: 'transparent', color: '#C9A84C', border: '1.5px solid #C9A84C',
    padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
    fontFamily: 'Nunito', fontWeight: '600', letterSpacing: '0.5px', transition: 'all 0.3s',
  },
  adminBtn: {
    background: 'linear-gradient(135deg, #8B1A1A, #5C0E0E)', color: '#C9A84C',
    border: '1.5px solid #8B1A1A', padding: '8px 20px', borderRadius: '4px',
    cursor: 'pointer', fontSize: '13px', fontFamily: 'Nunito', fontWeight: '700',
    letterSpacing: '0.5px', transition: 'all 0.3s',
  },

  heroSection: { position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroImg: { position: 'absolute', inset: 0, transition: 'opacity 0.6s ease' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,10,10,0.85) 0%, rgba(45,21,21,0.7) 100%)' },
  heroContent: { position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: '700px' },
  heroSub: { color: '#C9A84C', fontSize: '14px', letterSpacing: '6px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px' },
  heroTitle: { fontFamily: 'Cinzel Decorative, cursive', color: '#FDF8EE', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '900', lineHeight: '1.2', marginBottom: '16px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' },
  heroCap: { color: 'rgba(253,248,238,0.8)', fontSize: '18px', fontStyle: 'italic', marginBottom: '32px' },
  heroBtns: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  dots: { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 2 },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s' },

  ornamentBar: {
    background: 'linear-gradient(90deg, #8B1A1A 0%, #C9A84C 50%, #8B1A1A 100%)',
    padding: '14px', textAlign: 'center',
  },
  ornamentText: { color: '#FDF8EE', fontFamily: 'Cinzel Decorative, cursive', fontSize: '13px', letterSpacing: '4px' },

  section: { padding: '80px 32px', maxWidth: '100%' },
  sectionHeader: { textAlign: 'center', marginBottom: '48px' },
  sectionLabel: { color: '#8B1A1A', fontSize: '11px', letterSpacing: '6px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '10px' },
  sectionTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#1A0A0A', lineHeight: '1.3' },

  aboutGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  aboutCard: { background: 'white', borderRadius: '8px', padding: '36px 28px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(201,168,76,0.2)', transition: 'transform 0.3s' },
  aboutIcon: { fontSize: '48px', marginBottom: '16px' },
  aboutCardTitle: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '14px', color: '#8B1A1A', marginBottom: '12px' },
  aboutCardText: { color: '#5C3D2E', fontSize: '14px', lineHeight: '1.8' },

  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '10px' },
  pricingCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '32px 24px', textAlign: 'center', position: 'relative', backdropFilter: 'blur(10px)', transition: 'transform 0.3s' },
  popularBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #C9A84C, #9A7832)', color: '#1A0A0A', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' },
  pkgName: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '16px', marginBottom: '6px' },
  pkgSub: { color: 'rgba(253,248,238,0.5)', fontSize: '13px', marginBottom: '20px' },
  pkgPrice: { fontFamily: 'Cinzel Decorative, cursive', fontSize: '32px', color: '#C9A84C', fontWeight: '900', marginBottom: '6px' },
  pkgAdvance: { color: 'rgba(253,248,238,0.6)', fontSize: '12px' },

  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  galleryItem: { position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer' },
  galleryImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' },
  galleryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(26,10,10,0.85))', padding: '24px 16px 16px', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'flex-end' },
  galleryCaption: { color: '#C9A84C', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontStyle: 'italic' },

  ctaSection: {
    background: 'linear-gradient(135deg, #8B1A1A 0%, #1A0A0A 100%)',
    padding: '80px 32px', textAlign: 'center',
  },
  ctaOrnament: { color: '#C9A84C', fontSize: '18px', letterSpacing: '16px', marginBottom: '20px' },
  ctaTitle: { fontFamily: 'Cinzel Decorative, cursive', color: '#FDF8EE', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '16px' },
  ctaText: { color: 'rgba(253,248,238,0.75)', fontSize: '18px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' },

  footer: { background: '#0D0505', padding: '40px 32px', textAlign: 'center' },
  footerTop: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' },
  footerName: { fontFamily: 'Cinzel Decorative, cursive', color: '#C9A84C', fontSize: '16px' },
  footerText: { color: 'rgba(253,248,238,0.4)', fontSize: '13px', marginTop: '6px' },
};
