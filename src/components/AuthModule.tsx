/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, Lock, Users, KeyRound, Radio, Eye, EyeOff, AlertOctagon, CheckCircle2, Search, Filter, ShieldAlert, Monitor, Globe, Plus, LogOut, Check } from 'lucide-react';
import { UserProfile, UserSession, AuditLogEntry } from '../types';

interface AuthModuleProps {
  user: UserProfile | null;
  onLoginSuccess: (user: UserProfile, token: string, session: UserSession) => void;
  onLogout: () => void;
  currentSessionId: string | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export default function AuthModule({
  user,
  onLoginSuccess,
  onLogout,
  currentSessionId,
  onClose,
  onUpdateUser
}: AuthModuleProps) {
  // Navigation states inside Security drawer: 
  // If not logged in, we have 'login' | 'register' | 'forgot' tabs.
  // If logged in, we show 'security-profile' | 'active-sessions' | 'audit-logs'
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [panelTab, setPanelTab] = useState<'status' | 'sessions' | 'audit'>('status');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'analyst' | 'viewer' | 'officer'>('viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Server interaction payloads
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');

  // Logged-in security views tables list
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Audits search and filter state
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('ALL');

  // Load backend active sessions and logs if logged in
  const loadSecurityState = async () => {
    try {
      const sRes = await fetch('/api/auth/sessions');
      if (sRes.ok) {
        const sData = await sRes.json();
        setActiveSessions(sData);
      }
      const lRes = await fetch('/api/auth/audit-logs');
      if (lRes.ok) {
        const lData = await lRes.json();
        setAuditLogs(lData);
      }
    } catch (err) {
      console.error('Failed to query security catalog', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadSecurityState();
      // Set up polling interval to keep security data fresh (Active monitoring)
      const interval = setInterval(loadSecurityState, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.status === 202 && data.mfaRequired) {
        // Prompt for MFA
        setMfaRequired(true);
        setMfaSecret(data.message.split(': ')[1] || 'MUNI7BOND8INDIA');
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || 'Authenication failed');
        // Reset code on 2FA failure to let user try again
        setTotpCode('');
        return;
      }

      setSuccessMsg('Terminal authenticated successfully. Synchronizing...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token, data.session);
        setMfaRequired(false);
        setPassword('');
        setTotpCode('');
      }, 800);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Endpoint unreachable. Ensure backend node is listening on port 3000.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to complete registration');
        return;
      }

      setSuccessMsg(`Account for "${name}" registered as [${role}]. You can now login.`);
      setTimeout(() => {
        setAuthView('login');
        setPassword('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Network error registering credentials API.');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        // Soft alert action
        if (sessionId === currentSessionId) {
          onLogout();
        } else {
          loadSecurityState();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTwoFactor = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !user.isTwoFactorEnabled })
      });
      
      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data.user);
        setSuccessMsg(user.isTwoFactorEnabled ? '2FA disabled successfully.' : '2FA activated. Scan your new secret key.');
      } else {
        setErrorMsg('Failed to update security policy.');
      }
    } catch (err) {
      setErrorMsg('Network error updating security settings.');
    } finally {
      setIsLoading(false);
      setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 3000);
    }
  };

  // Filter audit logs based on search query, module, and state
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesModule = auditModuleFilter === 'ALL' || log.module === auditModuleFilter;
    const matchesStatus = auditStatusFilter === 'ALL' || log.status === auditStatusFilter;

    return matchesSearch && matchesModule && matchesStatus;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white border border-slate-100 rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header bar of Security Console */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Financial Terminal Gatekeeper</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-black animate-pulse uppercase tracking-tighter">Live Monitor</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">SESSION MANAGER & AUDIT TRAILS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm border border-slate-800 hover:border-slate-700 bg-slate-950 px-2.5 py-1 rounded cursor-pointer transition-all"
          >
            Esc Close [x]
          </button>
        </div>

        {/* Action Panel area */}
        {user ? (
          /* LOGGED IN TERMINAL SECURE PANEL STATE */
          <div className="flex-1 flex overflow-hidden max-h-[75vh]">
            {/* Sidebar navigation for logged-in security console */}
            <div className="w-56 bg-slate-50 border-r border-slate-150 p-3 flex flex-col justify-between select-none">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block px-2 mb-2">My Credentials</span>
                <button
                  onClick={() => setPanelTab('status')}
                  className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    panelTab === 'status' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  <KeyRound size={14} />
                  Terminal Access Status
                </button>
                <button
                  onClick={() => setPanelTab('sessions')}
                  className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    panelTab === 'sessions' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  <Monitor size={14} />
                  Workspace Sessions
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="bg-slate-900/10 text-[9px] px-1 rounded-full">{activeSessions.length}</span>
                  </div>
                </button>
                <button
                  onClick={() => setPanelTab('audit')}
                  className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    panelTab === 'audit' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  <Globe size={14} />
                  Audit logs report
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="bg-slate-900/10 text-[9px] px-1 rounded-full">{auditLogs.length}</span>
                  </div>
                </button>
              </div>

              {/* Quick Profile info and sign-off */}
              <div className="p-2 border-t border-slate-200 text-slate-500 text-[11px] font-sans">
                <p className="font-semibold text-slate-700">Identity Verified</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 uppercase tracking-wide">
                  ✔ {user.role} Authorization
                </span>
                <button
                  onClick={onLogout}
                  className="w-full mt-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all uppercase"
                >
                  <LogOut size={12} />
                  De-authorize terminal
                </button>
              </div>
            </div>

            {/* Main view panel context */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              {panelTab === 'status' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Terminal Gatekeeper Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1">Monitor recent terminal handshakes and verified access signatures.</p>
                  </div>

                  {/* Recent Logins replacement for 2FA */}
                  <div className="bg-slate-50 border border-slate-100 rounded-md p-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <ShieldAlert size={16} className="text-orange-500" />
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Recent Administrative Handshakes</span>
                    </div>
                    
                    <div className="space-y-2">
                      {auditLogs.filter(l => l.action === 'USER_LOGIN').slice(0, 3).map(log => (
                        <div key={log.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <div>
                              <p className="font-bold text-slate-700">Successful Signature Match</p>
                              <p className="text-[9px] text-slate-400 font-mono">{log.ipAddress} • {log.userEmail}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                      {auditLogs.filter(l => l.action === 'USER_LOGIN').length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-4">No recent handshake records detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Certificate parameters block */}
                  <div className="border border-slate-100 rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Account Authorization Status</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Active Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === 'sessions' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Connected Device & Session Registry</h4>
                    <p className="text-xs text-slate-400 mt-1">Listed are devices with authorized access tokens to MuniBond India database feeds.</p>
                  </div>

                  <div className="space-y-2">
                    {activeSessions.map(ses => (
                      <div
                        key={ses.id}
                        className={`border rounded-lg p-3 flex items-center justify-between ${
                          ses.id === currentSessionId ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="bg-slate-100 border border-slate-200 text-slate-500 p-2 rounded mt-0.5 shrink-0">
                            <Monitor size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-slate-700 truncate">{ses.userAgent.split('(')[0]}</p>
                              {ses.id === currentSessionId && (
                                <span className="text-[9px] font-bold font-mono text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded uppercase">Current Desk</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                              <span className="font-bold">{ses.ipAddress}</span>
                              <span>•</span>
                              <span>Signed In: {new Date(ses.loginTime).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRevokeSession(ses.id)}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Revoke Token
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panelTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Internal Audit Logging Trail</h4>
                      <p className="text-xs text-slate-400 mt-1">Tracks authorized entries, rating audits, and transactions.</p>
                    </div>
                  </div>

                  {/* Audit filters */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 border border-slate-100 rounded-md">
                    <div className="flex-1 min-w-[200px] relative">
                      <input
                        type="text"
                        placeholder="Filter audit logs..."
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded bg-white text-slate-700"
                      />
                      <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>

                    <select
                      value={auditModuleFilter}
                      onChange={(e) => setAuditModuleFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded p-1.5 bg-white text-slate-600 outline-none"
                    >
                      <option value="ALL">All Modules</option>
                      <option value="auth">Security</option>
                      <option value="bonds">Bonds Ledger</option>
                      <option value="analytics">Analytics</option>
                      <option value="settings">Settings</option>
                      <option value="api">API Feed</option>
                    </select>

                    <select
                      value={auditStatusFilter}
                      onChange={(e) => setAuditStatusFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded p-1.5 bg-white text-slate-600 outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="success">Success</option>
                      <option value="failure">Failed Alerts</option>
                    </select>
                  </div>

                  {/* Audit Logging Table */}
                  <div className="border border-slate-100 rounded overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono font-semibold uppercase">
                          <th className="p-2 w-20">Time</th>
                          <th className="p-2 w-24">Actor</th>
                          <th className="p-2 w-24">Event Log</th>
                          <th className="p-2 w-20">Module</th>
                          <th className="p-2">Description / Parameter Specs</th>
                          <th className="p-2 w-16 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-55">
                        {filteredAuditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 italic">No matching records available.</td>
                          </tr>
                        ) : (
                          filteredAuditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                              <td className="p-2 font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="p-2 font-sans font-semibold text-slate-600 truncate max-w-[90px]">{log.userName}</td>
                              <td className="p-2 font-mono font-semibold text-slate-700">{log.action}</td>
                              <td className="p-2"><span className="bg-slate-100 px-1 rounded text-slate-500 text-[9px] font-mono font-bold uppercase">{log.module}</span></td>
                              <td className="p-2 text-slate-500 font-sans max-w-[200px] truncate" title={log.details}>{log.details}</td>
                              <td className="p-2 text-center">
                                <span className={`inline-block w-22 font-mono font-bold text-[9px] uppercase rounded py-0.2 text-center ${
                                  log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ANONYMOUS FORM SIGN UP / SIGN IN PANEL */
          <div className="p-8 max-w-md mx-auto w-full flex-1 flex flex-col justify-center select-none">
            
            {/* Tab switches */}
            <div className="flex border-b border-slate-100 mb-6 shrink-0">
              <button
                onClick={() => { setAuthView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center tracking-tight border-b-2 transition-colors cursor-pointer ${
                  authView === 'login' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In Desk
              </button>
              <button
                onClick={() => { setAuthView('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center tracking-tight border-b-2 transition-colors cursor-pointer ${
                  authView === 'register' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Terminal Handshake
              </button>
            </div>

            {/* Error notifications bubble */}
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] p-3 rounded-md flex items-start gap-2 animate-shake">
                <AlertOctagon size={14} className="shrink-0 mt-0.5" />
                <p className="font-semibold leading-tight">{errorMsg}</p>
              </div>
            )}

            {/* Success notifications bubble */}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] p-3 rounded-md flex items-start gap-2">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                <p className="font-semibold leading-tight">{successMsg}</p>
              </div>
            )}

            {authView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 font-sans">
                {!mfaRequired ? (
                  <>
                    <p className="text-[11px] text-slate-400 leading-normal pb-2">
                      Secure login is configured. Input administrative credentials associated with your financial desk.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Terminal E-Mail Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. tor79359@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Workspace Password</label>
                        <button
                          type="button"
                          onClick={() => setAuthView('forgot')}
                          className="text-[10px] text-orange-500 hover:underline cursor-pointer"
                        >
                          Lock recovery?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 pr-10 bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-orange-50/50 border border-orange-100 rounded-md p-3 text-slate-700 text-[11px] flex items-start gap-2.5">
                      <ShieldAlert size={16} className="text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Multi-Factor Policy Check</p>
                        <p className="mt-1">Enter code from scanning QR code or verify secret key: <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-1 rounded">{mfaSecret}</span></p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-center">
                      <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Authenticator OTP (6-Digit Token)</label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        placeholder="123456"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        className="text-center font-mono text-base tracking-widest font-bold w-48 border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50 mx-auto block"
                      />
                      <button
                        type="button"
                        onClick={() => { setMfaRequired(false); setTotpCode(''); }}
                        className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold block pt-2 mx-auto"
                      >
                        ← Back to Password Desk
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-950 font-bold text-xs rounded text-white cursor-pointer transition-all uppercase select-none tracking-wide flex items-center justify-center gap-2"
                >
                  <LogIn size={14} />
                  {isLoading ? 'Authorizing Desk...' : 'Validate Terminal Signature'}
                </button>
                <div className="bg-slate-55 border border-slate-100 p-2 text-[9px] text-slate-400 rounded-md font-mono text-center leading-normal">
                  PRESET: Password matches is `<span className="font-bold text-slate-500">password</span>` for email `<span className="font-bold text-slate-500">tor79359@gmail.com</span>`.
                </div>
              </form>
            )}

            {authView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 font-sans">
                <p className="text-[11px] text-slate-400 leading-normal pb-1">
                  Create credentials and claim your municipal agency role to unlock secure dashboard components.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Full Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Officer BBMP"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Account E-Mail ID</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. officer@bbmp.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Password Secret</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Platform Authorization Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <option value="viewer">Viewer (Read-only Price Alerts)</option>
                    <option value="officer">Corporation Officer (Agency ledgers)</option>
                    <option value="analyst">Analyst (Edit prices & ratings)</option>
                    <option value="admin">Administrator (Complete access)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-900 border border-slate-950 font-bold text-xs rounded text-white cursor-pointer transition-all uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  {isLoading ? 'Seeding Identity...' : 'Dispatch Registry Token'}
                </button>
              </form>
            )}

            {authView === 'forgot' && (
              <div className="space-y-4 font-sans">
                <h4 className="text-xs font-bold text-slate-800">Credential Key Signature Reset</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your registered corporate email addresses. Our security protocol will deliver a seed recovery link.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase block">Registered E-Mail</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@bbmp.gov.in"
                    className="w-full text-xs border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2.5 bg-slate-50"
                  />
                </div>
                <button
                  onClick={() => {
                    setSuccessMsg('Recovery seed dispatched. Consult your mail service logs.');
                    setTimeout(() => { setSuccessMsg(''); setAuthView('login'); }, 1500);
                  }}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded cursor-pointer transition-all"
                >
                  Dispatch Security Token
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 block text-center pt-2"
                >
                  ← Return to Sign-in Desk
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
