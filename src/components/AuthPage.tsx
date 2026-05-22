/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  LogIn, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ChevronRight, 
  Globe, 
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserSession, UserRole } from '../types';
import { signInWithGoogle } from '../firebase';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password, 
          totpCode 
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.status === 202 && data.mfaRequired) {
        setTotpRequired(true);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setTotpCode('');
        return;
      }

      setSuccess('Access Granted. Redirecting to Terminal...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 1000);

    } catch (err) {
      setIsLoading(false);
      setError('Connection to security node failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess('Account provisioned. Please sign in.');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      setError('Network synchronization error.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      // Simulate backend registration/login with Google data
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          password: 'google-auth-simulated-password', // Mock password for session creation
          isGoogleAuth: true 
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setSuccess(`Welcome, ${user.displayName}. Access Granted.`);
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1000);
      } else {
        setError(data.error || 'Google Authentication failed at gateway.');
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.code === 'auth/popup-closed-by-user' 
        ? 'Sign-in popup was closed before completion.' 
        : err.code === 'auth/operation-not-allowed'
        ? 'Google Sign-In is not enabled in Firebase Console.'
        : 'Google Sign-In failed. Check console for details.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-xl italic">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight">MUNIBOND</span>
                <span className="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">India Intelligence</span>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Secure Access to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Municipal Markets
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                India's premier real-time ledger for municipal bond tracking, 
                revenue analytics, and fiscal transparency across state corporations.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              {[
                { icon: ShieldCheck, text: 'AES-256 Encrypted Handshake' },
                { icon: Globe, text: 'Real-time NSE/BSE Data Feeds' },
                { icon: Lock, text: 'Multi-Factor Authentication' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <item.icon size={16} className="text-orange-500" />
                  </div>
                  <span className="text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-[10px] font-mono flex items-center gap-4">
            <span>v0.8.4-STABLE</span>
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <span>ENCRYPTED NODE: IN-MUM-01</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm italic">M</span>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">MUNIBOND INDIA</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {totpRequired ? 'Security Verification' : isLogin ? 'Terminal Login' : 'Provision Account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {totpRequired 
                  ? 'Enter the 6-digit verification code' 
                  : isLogin 
                    ? 'Enter your credentials to access the ledger' 
                    : 'Create your municipal investigator profile'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {totpRequired ? (
                <motion.form
                  key="totp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">MFA Verification Code</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-mono tracking-[0.5em]"
                      />
                    </div>
                  </div>
                  <button
                    disabled={isLoading}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Validate & Enter'}
                    {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTotpRequired(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Back to credentials
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={isLogin ? handleLogin : handleRegister}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Ananya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="officer@munibond.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white text-sm focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Assignment Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="viewer" className="bg-slate-900">Market Viewer</option>
                        <option value="analyst" className="bg-slate-900">Financial Analyst</option>
                        <option value="officer" className="bg-slate-900">Municipal Officer</option>
                      </select>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs p-3 rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={14} className="shrink-0" />
                      {success}
                    </div>
                  )}

                  <button
                    disabled={isLoading}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : isLogin ? 'Access Ledger' : 'Create Profile'}
                    {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </button>

                  {isLogin && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                          <span className="bg-[#0f172a] px-4 text-slate-500">Or continue with</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z"
                          />
                        </svg>
                        Sign in with Google
                      </button>
                    </>
                  )}

                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-xs text-slate-500 hover:text-white transition-colors"
                    >
                      {isLogin 
                        ? "Don't have an account? Create one" 
                        : "Already have an account? Sign in"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
