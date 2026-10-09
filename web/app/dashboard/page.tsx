'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  Download,
  Copy,
  Check,
  Calendar,
  Key,
  Shield,
  HelpCircle,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { formatDate, getRemainingDays } from '@/lib/utils';
import Link from 'next/link';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const user = session?.user;
  const expiry = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const { days, isExpired } = expiry ? getRemainingDays(expiry) : { days: 0, isExpired: true };

  const handleCopyKey = () => {
    if (user?.licenseKey) {
      navigator.clipboard.writeText(user.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ padding: '40px 0 80px 0' }}>
        <div className="container">
          {/* Welcome Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
                Welcome, {user?.name || 'Customer'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Manage your license key and download your Chrome extension.
              </p>
            </div>

            {user?.role === 'admin' && (
              <Link href="/admin" className="btn btn-secondary">
                <Shield size={16} />
                <span>Go to Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Expiration warning banner if expired */}
          {isExpired && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '16px 20px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                marginBottom: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="#f87171" />
                <div>
                  <strong style={{ color: '#fca5a5', display: 'block', fontSize: '14px' }}>
                    Your subscription has expired
                  </strong>
                  <span style={{ fontSize: '13px', color: '#f87171' }}>
                    Access in the Chrome Extension is currently locked. Contact the administrator to renew.
                  </span>
                </div>
              </div>
              <a
                href="https://wa.me/?text=Hello!%20My%20FB%20Exporter%20account%20has%20expired%20and%20I%20would%20like%20to%20renew."
                target="_blank"
                className="btn btn-danger btn-sm"
              >
                Renew Subscription on WhatsApp
              </a>
            </div>
          )}

          {/* Top Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '36px',
            }}
          >
            {/* Subscription Status Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Subscription Status
                </span>
                <span className={`badge ${isExpired ? 'badge-expired' : 'badge-active'}`}>
                  {isExpired ? '● Expired' : '● Active License'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isExpired ? '#f87171' : '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                    {isExpired ? '0 Days' : `${days} Days Left`}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Expires on {formatDate(expiry)}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Your account was activated by the administrator. Need more time? Contact the admin to extend your subscription.
              </p>
            </div>

            {/* License Key Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Your License Key
                </span>
                <span className="badge badge-admin">Manifest V3 Key</span>
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <code style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px' }}>
                  {user?.licenseKey || 'FBX-XXXX-XXXX-XXXX'}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#10b981" />
                      <span style={{ color: '#10b981' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Paste this key inside the Chrome extension popup to authenticate and unlock scraping.
              </p>
            </div>
          </div>

          {/* Extension Download & Quick Setup Card */}
          <div className="glass-card" style={{ marginBottom: '36px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                  Chrome Extension Package
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Download the latest pre-configured build ready for Chrome, Edge, and Brave browsers.
                </p>
              </div>

              <a
                href="/fb-exporter-extension.zip"
                download="fb-exporter-extension.zip"
                className="btn btn-accent btn-lg"
              >
                <Download size={18} />
                <span>Download Extension (.ZIP)</span>
              </a>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#e2e8f0' }}>
              Quick Installation Guide (Takes 60 seconds):
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.6)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#60a5fa', marginBottom: '6px' }}>
                  Step 1: Extract ZIP
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Right-click the downloaded <code>fb-exporter-extension.zip</code> file and extract it to a folder.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.6)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#60a5fa', marginBottom: '6px' }}>
                  Step 2: Extensions Page
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Open Chrome or Edge and go to <code>chrome://extensions</code>. Toggle <strong>Developer mode</strong> (top-right).
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.6)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#60a5fa', marginBottom: '6px' }}>
                  Step 3: Load Unpacked
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Click <strong>Load unpacked</strong> (top-left) and select the extracted extension folder.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(11, 17, 32, 0.6)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#10b981', marginBottom: '6px' }}>
                  Step 4: Activate & Scrape
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Click the extension icon, paste your License Key, open any Facebook Group Members tab, and export!
                </p>
              </div>
            </div>
          </div>

          {/* Safety & Best Practices */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#34d399" />
              <span>Recommended Safe Scraping Guidelines</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li>• Keep the default scroll delay at <strong>2.5s - 3.5s</strong> to maintain natural browsing behavior.</li>
              <li>• For large groups (10k+ members), export in chunks of <strong>1,000 to 2,000 members</strong> to stay under Facebook temporary rate limits.</li>
              <li>• CSV exports automatically preserve 15-digit Facebook numeric IDs as text so Microsoft Excel does not truncate them.</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
