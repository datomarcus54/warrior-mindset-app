import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup' | 'reset';
type ResetStep = 'email' | 'code-and-password';

const AuthView: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const resetMessages = () => {
    setError('');
    setNotice('');
  };

  const resetResetFlow = () => {
    setResetStep('email');
    setResetCode('');
    setNewPassword('');
  };

  const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

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

    const normalizedEmail = normalizeEmail(email);
    const code = generateResetCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const { error: deleteError } = await supabase
      .from('password_reset_codes')
      .delete()
      .eq('email', normalizedEmail);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from('password_reset_codes').insert({
      email: normalizedEmail,
      code,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) throw insertError;

    const emailRes = await fetch('/.netlify/functions/send-password-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, code }),
    });

    if (!emailRes.ok) {
      const err = (await emailRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || 'Failed to send reset code email.');
    }

    setNotice('Code sent to your email');
    setResetStep('code-and-password');
  };

  const handlePasswordResetWithCode = async () => {
    if (!supabase) return;

    const normalizedEmail = normalizeEmail(email);
    const trimmedCode = resetCode.trim();

    const { data: record, error: fetchError } = await supabase
      .from('password_reset_codes')
      .select('email, code, expires_at')
      .eq('email', normalizedEmail)
      .eq('code', trimmedCode)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!record) {
      throw new Error('Invalid reset code. Please try again.');
    }

    const expiresAt = new Date(record.expires_at);
    if (expiresAt.getTime() <= Date.now()) {
      throw new Error('This reset code has expired. Please request a new one.');
    }

    // admin.updateUserById requires the service role key — runs server-side only
    const updateRes = await fetch('/.netlify/functions/complete-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        code: trimmedCode,
        newPassword,
      }),
    });

    if (!updateRes.ok) {
      const err = (await updateRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || 'Failed to update password.');
    }

    setNotice('Password updated. Please log in.');
    resetResetFlow();
    setMode('login');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (mode === 'reset' && resetStep === 'email') {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
    } else if (mode === 'reset' && resetStep === 'code-and-password') {
      if (!resetCode.trim()) {
        setError('Please enter the 6-digit code.');
        return;
      }
      if (resetCode.trim().length !== 6) {
        setError('Code must be exactly 6 digits.');
        return;
      }
      if (!newPassword.trim()) {
        setError('Please enter your new password.');
        return;
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    } else {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if ((mode === 'login' || mode === 'signup') && !password.trim()) {
        setError('Please enter your password.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') await handleLogin();
      if (mode === 'signup') await handleSignup();
      if (mode === 'reset' && resetStep === 'email') await handlePasswordReset();
      if (mode === 'reset' && resetStep === 'code-and-password') await handlePasswordResetWithCode();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    mode === 'login'
      ? 'Log In'
      : mode === 'signup'
        ? 'Create Account'
        : resetStep === 'email'
          ? 'Reset Password'
          : 'Enter Code & New Password';

  const cta =
    mode === 'login'
      ? 'Log In'
      : mode === 'signup'
        ? 'Create Account'
        : resetStep === 'email'
          ? 'Send Code'
          : 'Update Password';

  const openResetFlow = () => {
    resetMessages();
    resetResetFlow();
    setMode('reset');
  };

  const backToLogin = () => {
    resetMessages();
    resetResetFlow();
    setMode('login');
  };

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
          {/* Reset step 1: email only */}
          {mode === 'reset' && resetStep === 'email' && (
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
          )}

          {/* Reset step 2: code + new password */}
          {mode === 'reset' && resetStep === 'code-and-password' && (
            <>
              <p className="text-sm text-[#45d0d0] font-semibold">
                Enter the 6-digit code sent to <span className="text-white">{email}</span>
              </p>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-[#45d0d0] mb-2">6-Digit Code</label>
                <div className="flex items-center gap-2 bg-[#eef1f1] border border-slate-300 rounded-lg px-3">
                  <Lock size={16} className="text-slate-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full py-3 bg-transparent text-[#595b61] outline-none font-semibold tracking-[0.3em]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-[#45d0d0] mb-2">New Password</label>
                <div className="flex items-center gap-2 bg-[#eef1f1] border border-slate-300 rounded-lg px-3">
                  <Lock size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full py-3 bg-transparent text-[#595b61] outline-none font-semibold"
                  />
                </div>
              </div>
            </>
          )}

          {/* Login / signup */}
          {mode !== 'reset' && (
            <>
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
            </>
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
          {mode === 'reset' && resetStep === 'code-and-password' && (
            <button
              onClick={() => {
                resetMessages();
                setResetStep('email');
              }}
              className="text-[#7f91aa] hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Back
            </button>
          )}
          {mode !== 'login' && !(mode === 'reset' && resetStep === 'code-and-password') && (
            <button
              onClick={backToLogin}
              className="text-[#7f91aa] hover:text-white flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Back to login
            </button>
          )}
          {mode === 'login' && (
            <>
              <button onClick={() => { resetMessages(); setMode('signup'); }} className="text-[#7f91aa] hover:text-white">Create account</button>
              <button onClick={openResetFlow} className="text-[#7f91aa] hover:text-white">Forgot password</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
