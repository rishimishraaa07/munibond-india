/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bond, CreditRating, RatingAgency, CorpCategory, UserSession, UserProfile } from '../types';
import { ShieldCheck, Plus, FileSpreadsheet, Lock, AlertCircle, Sparkles, Server, Users, Monitor, LogOut } from 'lucide-react';

interface AdminConsoleProps {
  bonds: Bond[];
  onAddBond: (newBond: Partial<Bond>) => Promise<boolean>;
  auditLogs: any[];
}

export default function AdminConsole({ bonds, onAddBond, auditLogs }: AdminConsoleProps) {
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Fetch session and user data
  const fetchSecurityData = async () => {
    try {
      const sRes = await fetch('/api/auth/sessions');
      if (sRes.ok) {
        const sData = await sRes.json();
        setActiveSessions(sData);
      }
      
      // We'll assume there's an endpoint to get all users or we use the sessions to map users
      // For this implementation, we'll focus on active sessions as requested
    } catch (err) {
      console.error('Failed to fetch admin security data', err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        fetchSecurityData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Form states for creating new bond
  const [corpName, setCorpName] = useState('Bruhat Bengaluru Mahanagara Palike');
  const [short, setShort] = useState('BBMP');
  const [state, setState] = useState('Karnataka');
  const [seriesId, setSeriesId] = useState('BBMP-820-ST34');
  const [facePrice, setFacePrice] = useState('100000');
  const [couponVal, setCouponVal] = useState('8.20');
  const [rting, setRting] = useState<CreditRating>('AA+');
  const [agency, setAgency] = useState<RatingAgency>('CRISIL');
  const [raisedCr, setRaisedCr] = useState('250');
  const [taxValue, setTaxValue] = useState<'Tax-Free' | 'Taxable'>('Tax-Free');
  const [projFunded, setProjFunded] = useState('Hebbal Flyover extension, Smart water grid system');

  const handleSubmitBond = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrorMsg('');

    if (!seriesId.trim()) {
      setErrorMsg('Series ID must be specified.');
      return;
    }

    const newObj: Partial<Bond> = {
      corporationName: corpName,
      shortName: short,
      state: state,
      bondId: seriesId,
      faceValue: parseFloat(facePrice) || 100000,
      currentPrice: parseFloat(facePrice) || 100000,
      yieldPercent: parseFloat(couponVal) || 8.0,
      rating: rting,
      ratingAgency: agency,
      maturityDate: '2034-03-15',
      change24h: 0.0,
      volume: 120.0,
      category: 'Metro',
      couponPercent: parseFloat(couponVal) || 8.0,
      paymentFrequency: 'Annual',
      taxStatus: taxValue,
      projectsFunded: projFunded.split(',').map(s => s.trim()),
      capitalRaisedCr: parseFloat(raisedCr) || 200,
      description: `Structured debt series issued for capital works. Backed by solid property tax collections.`,
      allTimeHigh: parseFloat(facePrice) || 100000,
      allTimeLow: parseFloat(facePrice) || 100000
    };

    const added = await onAddBond(newObj);
    if (added) {
      setSuccess(`New bond series "${seriesId}" successfully seeded into Municipal Ledgers.`);
      setSeriesId('BBMP-840-OC35');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setErrorMsg('Failure publishing bond series. Verify payload parameters.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none text-left">
      
      {/* SEED FORM FOR NEW BOND */}
      <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm lg:col-span-2 space-y-4">
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <ShieldCheck size={18} className="text-orange-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sovereign Muni Series Composition</h3>
            <p className="text-[10px] text-slate-400">Compose and seed a new sovereign Municipal Corporation Bond directly into database registers.</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs p-3 rounded-md font-semibold">
            ✔ {success}
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-3 rounded-md font-semibold">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitBond} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Corporation Name</span>
            <input
              type="text"
              required
              value={corpName}
              onChange={(e) => setCorpName(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Short Name Tag</span>
            <input
              type="text"
              required
              value={short}
              onChange={(e) => setShort(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">State Territory</span>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">New Series ID</span>
            <input
              type="text"
              required
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Face Price (₹)</span>
            <input
              type="number"
              required
              value={facePrice}
              onChange={(e) => setFacePrice(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Coupon rate %</span>
            <input
              type="number"
              step="0.01"
              required
              value={couponVal}
              onChange={(e) => setCouponVal(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Credit Rating Grade</span>
            <select
              value={rting}
              onChange={(e: any) => setRting(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 outline-none cursor-pointer"
            >
              <option value="AAA">AAA (High Safety)</option>
              <option value="AA+">AA+ (Premium Grade)</option>
              <option value="AA">AA (Strong Safety)</option>
              <option value="AA-">AA- (Favorable Grade)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Allocated Capital (₹ Crores)</span>
            <input
              type="number"
              required
              value={raisedCr}
              onChange={(e) => setRaisedCr(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1 md:col-span-2 text-left">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Funded Infrastructure Works</span>
            <input
              type="text"
              required
              value={projFunded}
              onChange={(e) => setProjFunded(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 focus:border-orange-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="md:col-span-2 py-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded cursor-pointer transition-all uppercase text-center flex items-center justify-center gap-1.5 font-mono tracking-wider shadow"
          >
            <Plus size={14} className="text-orange-500 animate-spin" />
            Validate & Publish to Ledger
          </button>
        </form>
      </div>

      {/* QUICK SYSTEM STATUS & LOGS SIDE PANEL */}
      <div className="space-y-4">
        
        {/* Core database and services states */}
        <div className="bg-slate-950 text-white border border-slate-950 p-4 rounded-lg relative overflow-hidden shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className="flex items-center gap-1.5 select-none uppercase font-mono text-[10px] font-bold text-slate-500 tracking-wider">
              <Server size={12} className="text-orange-500" />
              Database Engine Status
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-2 select-text font-mono text-[10px] pr-2">
            <p className="flex justify-between">
              <span className="text-slate-500 uppercase">PRIMARY ENGINE:</span>
              <span className="font-bold text-slate-300">PosgreSQL 16.2</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500 uppercase">CACHING REPLICA:</span>
              <span className="font-bold text-slate-300">Redis Cache active</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500 uppercase">SOCKET CONNS:</span>
              <span className="font-bold text-emerald-500 animate-pulse font-semibold">14 ACTIVE DEK DEVICES</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500 uppercase">CPU CAPACITY:</span>
              <span className="font-bold text-slate-350">14.2% usage</span>
            </p>
          </div>
        </div>

        {/* Short list of visual audit warnings */}
        <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider border-b border-slate-50 pb-2">Active Security Warnings</h4>
          
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-md flex items-start gap-2 text-slate-700 text-[10px] font-sans">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">2FA Bypass notice disabled</p>
                <p className="mt-0.5 text-slate-500">MuniBond India enforces strict TOTP checks on all analyst modifications.</p>
              </div>
            </div>

            <div className="bg-slate-55 border border-slate-150 p-2.5 rounded-md text-[10px] font-mono leading-normal text-slate-500 text-center select-text">
              ✔ Every action listed here is permanently audited inside the PGSQL `audit_logs` table.
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE SESSIONS PANEL */}
      <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm space-y-4 h-fit">
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Users size={18} className="text-orange-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Active Workspace Sessions</h3>
            <p className="text-[10px] text-slate-400">Monitor real-time investigator access and terminal handshakes.</p>
          </div>
        </div>

        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              No active sessions detected.
            </div>
          ) : (
            activeSessions.map(session => (
              <div key={session.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      <Monitor size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                        {session.id} {session.isCurrent && <span className="text-[9px] text-emerald-600 ml-1">● ACTIVE</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{session.ipAddress}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                      title="Revoke Session"
                    >
                      <LogOut size={14} />
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-sans leading-tight border-t border-slate-200/50 pt-2">
                  <p className="truncate"><span className="font-semibold uppercase text-[9px] text-slate-400">Agent:</span> {session.userAgent}</p>
                  <p className="mt-1"><span className="font-semibold uppercase text-[9px] text-slate-400">Login:</span> {new Date(session.loginTime).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
