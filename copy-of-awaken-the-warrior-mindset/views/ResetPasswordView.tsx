import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ResetPasswordViewProps {
  onComplete: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setNotice('Password updated. Please log in.');
      await supabase.auth.signOut();
      onComplete();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-xl font-black uppercase tracking-wider text-white">Set New Password</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-[#45d0d0] mb-2">Confirm New Password</label>
            <div className="flex items-center gap-2 bg-[#eef1f1] border border-slate-300 rounded-lg px-3">
              <Lock size={16} className="text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full py-3 bg-transparent text-[#595b61] outline-none font-semibold"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-300 font-semibold">{error}</p>}
          {notice && <p className="text-sm text-[#45d0d0] font-semibold">{notice}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !supabase}
            className="w-full py-3 bg-[#f78121] hover:bg-orange-600 disabled:bg-slate-500 disabled:cursor-not-allowed rounded-lg text-white font-black uppercase tracking-widest text-xs"
          >
            {isSubmitting ? 'Please wait...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordView;
