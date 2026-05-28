import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup' | 'reset';

const AuthView: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const resetMessages = () => {
    setError('');
    setNotice('');
  };

  const handleLogin = async () => {
    if (!supabase) return;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
  };

  const handleSignup = async () => {
    if (!supabase) return;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;
    setNotice('Account created. Please check your email and confirm before logging in.');
  };

  const handlePasswordReset = async () => {
    if (!supabase) return;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) throw resetError;
    setNotice('Password reset email sent. Please check your inbox.');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if ((mode === 'login' || mode === 'signup') && !password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') await handleLogin();
      if (mode === 'signup') await handleSignup();
      if (mode === 'reset') await handlePasswordReset();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Reset Password';
  const cta = mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link';

  return (
    <div className="min-h-screen bg-[#0A3762] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#595b61] border border-[#f78121]/40 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#f78121]/20 border border-[#f78121]/30">
            <Shield className="text-[#f78121]" size={20} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-black text-[#45d0d0]">Awaken the Warrior Mindset</p>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">{title}</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-[#45d0d0] mb-2">Email</label>
            <div className="flex items-center gap-2 bg-[#eef1f1] border border-slate-300 rounded-lg px-3">
              <Mail size={16} className="text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full py-3 bg-transparent text-[#595b61] outline-none font-semibold"
              />
            </div>
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-[#45d0d0] mb-2">Password</label>
              <div className="flex items-center gap-2 bg-[#eef1f1] border border-slate-300 rounded-lg px-3">
                <Lock size={16} className="text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-3 bg-transparent text-[#595b61] outline-none font-semibold"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-300 font-semibold">{error}</p>}
          {notice && <p className="text-sm text-[#45d0d0] font-semibold">{notice}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !supabase}
            className="w-full py-3 bg-[#f78121] hover:bg-orange-600 disabled:bg-slate-500 disabled:cursor-not-allowed rounded-lg text-white font-black uppercase tracking-widest text-xs"
          >
            {isSubmitting ? 'Please wait...' : cta}
          </button>
        </form>

        {!supabase && (
          <p className="mt-4 text-xs text-amber-300">
            Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your environment file.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-widest font-black">
          {mode !== 'login' && (
            <button
              onClick={() => {
                resetMessages();
                setMode('login');
              }}
              className="text-[#7f91aa] hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Back to login
            </button>
          )}
          {mode === 'login' && (
            <>
              <button onClick={() => { resetMessages(); setMode('signup'); }} className="text-[#7f91aa] hover:text-white">Create account</button>
              <button onClick={() => { resetMessages(); setMode('reset'); }} className="text-[#7f91aa] hover:text-white">Forgot password</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
