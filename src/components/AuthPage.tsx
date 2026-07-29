import React, { useState } from 'react';
import { Store, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, Building2, Loader2, MailCheck } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { supabase } from '../services/supabaseClient';
import { ImageUploader } from './ImageUploader';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  onCancel?: () => void;
  message?: string;
}

// Self sign-up only ever offers these two roles. There is no "System
// Admin" option here on purpose — admin accounts are never created by
// the client. See supabase/schema.sql for how the server enforces this
// even if someone tampers with the request.
type SelfSignupRole = 'customer' | 'vendor';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onCancel, message }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<SelfSignupRole>('customer');
  const [signupPhone, setSignupPhone] = useState('+233 24 000 0000');
  const [signupLocation, setSignupLocation] = useState('Accra, Ghana');

  // Vendor specific signup state
  const [vendorName, setVendorName] = useState('');
  const [vendorTagline, setVendorTagline] = useState('Faith-based artisan products and quality crafts.');
  const [vendorLogo, setVendorLogo] = useState('');
  const [vendorBanner, setVendorBanner] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
        return;
      }
      if (!data.user) {
        setErrorMsg('Login failed. Please try again.');
        return;
      }
      const profile = await storage.getProfile(data.user.id);
      if (!profile) {
        setErrorMsg('Signed in, but no profile was found for this account. Contact an administrator.');
        return;
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong signing you in.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (signupRole === 'vendor' && !vendorName.trim()) {
      setErrorMsg('Please provide your brand / store name.');
      return;
    }

    setBusy(true);
    try {
      // requested_role is only ever read server-side to decide 'vendor' vs
      // 'customer' — the server never trusts a client-sent 'admin' value.
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: {
            requested_role: signupRole,
            name: signupName.trim(),
            phone: signupPhone,
            location: signupLocation,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Could not create your account.');
        return;
      }

      // If email confirmation is required by the Supabase project, there
      // will be no session yet — the profile row still gets created by
      // the server-side trigger, but vendor setup has to wait until the
      // person confirms and logs in.
      if (!data.session) {
        setInfoMsg('Account created! Check your email to confirm it, then log in below.');
        setMode('login');
        setEmail(signupEmail.trim());
        return;
      }

      if (signupRole === 'vendor') {
        await storage.registerVendorForCurrentUser({
          name: vendorName.trim(),
          tagline: vendorTagline,
          logoUrl: vendorLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
          bannerUrl: vendorBanner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          location: signupLocation,
          email: signupEmail.trim(),
          phone: signupPhone,
        });
      }

      const profile = await storage.getProfile(data.user!.id);
      if (!profile) {
        setErrorMsg('Account created, but your profile could not be loaded. Try logging in.');
        return;
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong creating your account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/20">
            <Building2 className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
          BMLE
        </h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
          Believers Market Linkage Enterprise
        </p>
        <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
          Premier Ghanaian Marketplace Connecting Faith-based Artisans, Merchants, & Buyers.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">

          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-start gap-3 shadow-lg shadow-amber-500/5">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold uppercase tracking-wider text-[11px] text-amber-400">Account Required</div>
                <div className="text-slate-200 mt-0.5 font-normal">{message}</div>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setInfoMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); setInfoMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Self-Signup
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2">
              <MailCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <span>Log In to BMLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>}
              </button>
            </form>
          ) : (
            /* SELF-SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Ama Serwaa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="ama.serwaa@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 chars)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Role Selection — customer or vendor only. System Admin
                  accounts can never be created through self sign-up. */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'customer' as const, label: 'Customer', icon: '🛍️' },
                    { id: 'vendor' as const, label: 'Merchant', icon: '🏪' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSignupRole(r.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        signupRole === r.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <span className="text-[11px]">{r.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  System Admin accounts are created only by an existing administrator.
                </p>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">City/Location</label>
                  <input
                    type="text"
                    value={signupLocation}
                    onChange={(e) => setSignupLocation(e.target.value)}
                    placeholder="East Legon, Accra"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Vendor Setup Section with DIRECT PICTURE UPLOAD */}
              {signupRole === 'vendor' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 mt-4">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Merchant Enterprise Setup</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Brand / Store Name</label>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g. Akoma Christian Crafts"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={vendorTagline}
                      onChange={(e) => setVendorTagline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* DIRECT FILE UPLOAD FOR VENDOR LOGO */}
                  <ImageUploader
                    label="Upload Store Logo Picture (File Upload)"
                    value={vendorLogo}
                    onChange={setVendorLogo}
                    aspectRatio="square"
                    placeholder="Choose image file from computer or phone"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <span>Create BMLE Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>}
              </button>
            </form>
          )}

          {onCancel && (
            <div className="mt-4 text-center">
              <button
                onClick={onCancel}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Continue as Guest Browser
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
