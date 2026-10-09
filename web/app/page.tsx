import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Users,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  Download,
  Lock,
  Search,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section style={{ padding: '80px 0 60px 0', textAlign: 'center' }}>
          <div className="container">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '24px',
              }}
            >
              <Zap size={14} />
              <span>Next-Generation Facebook Group Exporter</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 800,
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                marginBottom: '24px',
                maxWidth: '900px',
                margin: '0 auto 24px auto',
              }}
            >
              Turn Facebook Groups Into{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                High-Value Lead Lists
              </span>{' '}
              In Seconds
            </h1>

            <p
              style={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: '0 auto 36px auto',
                lineHeight: 1.6,
              }}
            >
              Extract verified numeric Facebook IDs, profile URLs, and names directly in your browser.
              No cloud server bans, no passwords leaked, and zero expensive proxy bills.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '48px',
              }}
            >
              <a href="#pricing" className="btn btn-primary btn-lg">
                <MessageCircle size={18} />
                <span>Get Access / Negotiate Plan</span>
              </a>
              <Link href="/login" className="btn btn-secondary btn-lg">
                <Users size={18} />
                <span>Customer Login</span>
              </Link>
            </div>

            {/* TRUST METRICS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                flexWrap: 'wrap',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-light)',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '24px', color: '#fff' }}>100%</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Client-Side Safe</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '24px', color: '#60a5fa' }}>50,000+</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Members per Export</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '24px', color: '#34d399' }}>Excel & CSV</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ready Format</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '24px', color: '#fbbf24' }}>Zero</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Proxy Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO PREVIEW CARD */}
        <section style={{ padding: '20px 0 80px 0' }}>
          <div className="container">
            <div
              className="glass-card"
              style={{
                maxWidth: '860px',
                margin: '0 auto',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                    FB Group Exporter Pro • Running in Chrome
                  </span>
                </div>
                <span className="badge badge-active">● Connected to SaaS License</span>
              </div>

              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.8)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    Target: facebook.com/groups/digitalmarketers/members
                  </span>
                  <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
                    1,240 / 1,500 Members Collected
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '82%',
                      background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                    }}
                  />
                </div>
              </div>

              {/* Sample output rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: '100083921901234', name: 'Alexander Wright', url: 'facebook.com/profile.php?id=100083921901234' },
                  { id: '100091240182941', name: 'Sophia Chen', url: 'facebook.com/groups/user/100091240182941' },
                  { id: '100047182910481', name: 'Marcus Johnson', url: 'facebook.com/profile.php?id=100047182910481' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{row.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{row.url}</span>
                    </div>
                    <span className="key-chip">ID: {row.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section id="features" style={{ padding: '60px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
                Engineered for Modern Lead Generation
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Forget outdated cloud scrapers that trigger immediate Facebook security checkpoints.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              <div className="glass-card">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  100% Account Safety
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Runs organically inside your browser with jitter delay, natural scrolling, and zero risk
                  of sharing your Facebook passwords with third-party servers.
                </p>
              </div>

              <div className="glass-card">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <FileSpreadsheet size={22} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Excel & Sheets Formatted
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Long Facebook numeric IDs (15+ digits) are encoded as text with UTF-8 BOM so spreadsheet
                  programs never truncate or corrupt your lead data.
                </p>
              </div>

              <div className="glass-card">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  Smart Deduplication
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Automatically maps canonical profile URLs and skips duplicates, avatars, and irrelevant
                  group admins to deliver clean, export-ready lists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: '60px 0', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
                How To Get Started In 3 Easy Steps
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Fast setup without complex installation or technical knowledge required.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontWeight: 700,
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  Request Account Activation
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Contact our administrator on WhatsApp or Telegram. We agree on your duration (e.g. 1 month, 3 months) and immediately activate your account.
                </p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontWeight: 700,
                  }}
                >
                  2
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  Install the Chrome Extension
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Log into your customer dashboard, download the extension .zip file, and load it into your Chrome or Edge browser.
                </p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontWeight: 700,
                  }}
                >
                  3
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  Export Groups Instantly
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Navigate to any Facebook group you have access to, click "Start Extraction", and download your ready-to-use CSV or JSON list.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING & DIRECT NEGOTIATION */}
        <section id="pricing" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span className="badge badge-active" style={{ marginBottom: '12px' }}>
                Flexible Tailored Licensing
              </span>
              <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>
                Custom Pricing & Direct Activation
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
                We believe in tailored pricing depending on your scraping volume and timeline.
                Contact us directly to negotiate your plan and get activated instantly.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                maxWidth: '1000px',
                margin: '0 auto 48px auto',
              }}
            >
              {/* Plan 1 */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Starter Sprint</h3>
                  <span className="badge badge-suspended">7 Days</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Ideal for one-time outreach projects or testing data quality on target groups.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Full Chrome Extension access
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Unlimited group exports
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> CSV & JSON downloads
                  </li>
                </ul>
                <a
                  href="https://wa.me/?text=Hello!%20I%20am%20interested%20in%20the%207-day%20FB%20Exporter%20plan."
                  target="_blank"
                  className="btn btn-secondary full-width"
                >
                  Inquire on WhatsApp
                </a>
              </div>

              {/* Plan 2 - Featured */}
              <div
                className="glass-card"
                style={{
                  border: '2px solid #3b82f6',
                  position: 'relative',
                  background: 'rgba(30, 41, 69, 0.9)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '2px 12px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  MOST POPULAR
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Monthly Pro</h3>
                  <span className="badge badge-active">30 Days</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Perfect for sales agencies, lead hunters, and marketing professionals.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Full Extension & Portal Access
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Unlimited members & groups
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Priority technical assistance
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Easy renewal at discounted rates
                  </li>
                </ul>
                <a
                  href="https://wa.me/?text=Hello!%20I%20am%20interested%20in%20the%201-month%20FB%20Exporter%20plan."
                  target="_blank"
                  className="btn btn-primary full-width"
                >
                  Inquire on WhatsApp
                </a>
              </div>

              {/* Plan 3 */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Quarterly / Agency</h3>
                  <span className="badge badge-admin">90+ Days</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  For high-volume lead scraping teams needing ongoing bulk exports.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Extended 90-365 days license
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Custom selectors if Facebook updates
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" /> Dedicated VIP direct chat support
                  </li>
                </ul>
                <a
                  href="https://wa.me/?text=Hello!%20I%20am%20interested%20in%20a%20Quarterly%20or%20Custom%20FB%20Exporter%20plan."
                  target="_blank"
                  className="btn btn-secondary full-width"
                >
                  Inquire on WhatsApp
                </a>
              </div>
            </div>

            {/* Direct Contact Banner */}
            <div
              className="glass-card"
              style={{
                maxWidth: '700px',
                margin: '0 auto',
                textAlign: 'center',
                padding: '36px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                Ready to negotiate and activate your account?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Contact the admin directly via WhatsApp or Email. We will agree on the price, create your account, and set your activation timer immediately.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/?text=Hi!%20I%20want%20to%20activate%20an%20account%20for%20FB%20Exporter."
                  target="_blank"
                  className="btn btn-accent"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
                <Link href="/login" className="btn btn-secondary">
                  <span>Already Have An Account? Sign In &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            borderTop: '1px solid var(--border-light)',
            padding: '36px 0',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          <div className="container">
            <p style={{ marginBottom: '8px' }}>
              &copy; 2026 FB Group Member Exporter Pro. All rights reserved.
            </p>
            <p style={{ fontSize: '12px' }}>
              For legal compliance, only scrape data from groups you have authorization to access.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
