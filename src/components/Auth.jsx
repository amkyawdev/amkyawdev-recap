import { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Shield, X, Send, AlertCircle } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Auth({ onClose, mode = 'login', onModeChange }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [isReset, setIsReset] = useState(mode === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { addToast } = useAppStore();

  useEffect(() => {
    setIsLogin(mode === 'login');
    setIsReset(mode === 'reset');
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.auth) {
      setError('Firebase not initialized. Please refresh the page.');
      setLoading(false);
      return;
    }

    if (isReset) {
      // Password Reset
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        setSuccess('Password reset email sent! Check your inbox.');
        addToast({ type: 'success', message: 'Password reset email sent!' });
      } catch (err) {
        setError(getFirebaseError(err.code));
      }
      setLoading(false);
      return;
    }

    if (isLogin) {
      // Firebase Login
      try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || email.split('@')[0],
          isLoggedIn: true
        };
        localStorage.setItem('user', JSON.stringify(userData));
        addToast({ type: 'success', message: `Welcome back, ${userData.name}!` });
        onClose?.();
      } catch (err) {
        setError(getFirebaseError(err.code));
      }
    } else {
      // Firebase Register
      try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name || email.split('@')[0] });
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: name || email.split('@')[0],
          isLoggedIn: true
        };
        localStorage.setItem('user', JSON.stringify(userData));
        addToast({ type: 'success', message: 'Account created successfully!' });
        onClose?.();
      } catch (err) {
        setError(getFirebaseError(err.code));
      }
    }

    setLoading(false);
  };

  const getFirebaseError = (code) => {
    const errors = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential': 'Invalid email or password.'
    };
    return errors[code] || 'An error occurred. Please try again.';
  };

  const handleGuestAccess = () => {
    localStorage.setItem('user', JSON.stringify({ 
      isLoggedIn: true,
      isGuest: true 
    }));
    addToast({ type: 'info', message: 'Continuing as guest' });
    onClose?.();
  };

  if (isReset) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Send size={32} color="white" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '4px' }}>
              Reset Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Enter your email to receive reset link
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', color: 'var(--error)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', color: 'var(--success)', fontSize: '0.9rem' }}>
                {success}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Remember your password?{' '}
            <button onClick={() => { setIsReset(false); setIsLogin(true); onModeChange?.('login'); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            marginBottom: '4px'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin 
              ? 'Sign in to access your projects' 
              : 'Join AmkyawDev Recap today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '16px',
              color: 'var(--error)',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ padding: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Guest Access */}
        <button
          onClick={handleGuestAccess}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Continue as Guest
        </button>

        {/* Toggle */}
        <p style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); onModeChange?.(isLogin ? 'register' : 'login'); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Reset Password Link */}
        {isLogin && (
          <p style={{ 
            textAlign: 'center', 
            marginTop: '12px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            Forgot password?{' '}
            <button
              onClick={() => { setIsReset(true); setIsLogin(false); onModeChange?.('reset'); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-secondary)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reset
            </button>
          </p>
        )}

        {/* Security Note */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={14} />
          <span>Your data is encrypted and secure</span>
        </div>
      </div>
    </div>
  );
}
