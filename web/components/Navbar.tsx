'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Users, Shield, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link href="/" className="brand">
          <div className="brand-icon">
            <Users size={20} />
          </div>
          <div>
            <span>FB Exporter</span>
            <span className="brand-badge">PRO</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/#how-it-works" className="nav-link">How It Works</Link>
          <Link href="/#pricing" className="nav-link">Plans & Pricing</Link>
        </div>

        <div className="nav-actions">
          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/admin" className="btn btn-secondary btn-sm">
                  <Shield size={14} />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                <UserCheck size={14} />
                <span>Customer Login</span>
              </Link>
              <Link href="/#pricing" className="btn btn-primary btn-sm">
                Get Access
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
