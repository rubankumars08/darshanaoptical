'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

// The "quick demo login" buttons that used to live here printed the seeded
// admin, manager and staff passwords directly on the public sign-in page and
// filled them in on click. Anyone who reached /admin/login could read working
// credentials, so the block has been removed.

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/admin/dashboard');
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  return (
    <div className="adm-login-root">
      <div className="adm-login-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#fc5a06',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 8px 24px rgba(252, 90, 6, 0.4)',
            }}
          >
            D
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>
            Darshana Optical
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0' }}>
            Admin Panel — Sign in to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)',
              borderRadius: 10, color: '#fca5a5', fontSize: 13.5,
            }}>
              <AlertCircle width={15} height={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 7, letterSpacing: '0.02em' }}>
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className="adm-login-input"
              placeholder="you@darshana.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 7, letterSpacing: '0.02em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                className="adm-login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            style={{
              height: 46,
              background: loading ? 'rgba(252, 90, 6, 0.6)' : '#fc5a06',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s ease',
              fontFamily: 'inherit',
              marginTop: 4,
              boxShadow: '0 4px 16px rgba(252, 90, 6, 0.35)',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Signing in…
              </>
            ) : (
              <>
                <LogIn width={16} height={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
          Darshana Optical Internal System · Harur, Tamil Nadu
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
