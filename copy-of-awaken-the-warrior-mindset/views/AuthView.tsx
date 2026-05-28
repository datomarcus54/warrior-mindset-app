import React, { useState } from 'react';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthView: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetStatus = () => {
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) throw signUpError;
        setMessage('Account created. Check your email to verify before logging in.');
      } else if (mode === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) throw loginError;
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });

        if (resetError) throw resetError;
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetStatus();
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 py-12 bg-[#0A3762] text-white font-brand-body">
      <div className="w-full max-w-md bg-[#595b61] border border-[#45d0d0]/30 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <img src="logo.png" alt="Warrior Mindset" className="h-12 w-auto mx-auto mb-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h1 className="text-2xl font-black font-brand-header uppercase tracking-wider text-[#f78121]">
            {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#45d0d0] mt-2">
            {mode === 'signup' ? 'Secure your warrior profile' : mode === 'forgot' ? 'Recover access to your account' : 'Log in to continue your mission'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#45d0d0] mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[#eef1f1] text-[#595b61] px-4 py-3 font-semibold outline-none border border-slate-300 focus:ring-2 focus:ring-[#f78121]/50"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#45d0d0] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-[#eef1f1] text-[#595b61] px-4 py-3 font-semibold outline-none border border-slate-300 focus:ring-2 focus:ring-[#f78121]/50"
                placeholder="Minimum 6 characters"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-300 bg-red-950/30 border border-red-400/30 rounded-lg p-3">{error}</p>}
          {message && <p className="text-sm text-[#45d0d0] bg-[#001b3d]/50 border border-[#45d0d0]/30 rounded-lg p-3">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#f78121] text-white font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Processing...' : mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Send Reset Email' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#45d0d0]/20 text-center space-y-3">
          {mode !== 'login' && (
            <button onClick={() => switchMode('login')} className="block w-full text-[10px] font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">
              Back to Log In
            </button>
          )}
          {mode !== 'signup' && (
            <button onClick={() => switchMode('signup')} className="block w-full text-[10px] font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">
              Create New Account
            </button>
          )}
          {mode !== 'forgot' && (
            <button onClick={() => switchMode('forgot')} className="block w-full text-[10px] font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">
              Forgot Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
