/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ApiKey, DataSource } from '../types';
import {
  User,
  BellRing,
  KeyRound,
  Users2,
  Database,
  Palette,
  Plus,
  Trash2,
  CheckCircle,
  Copy,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SettingsPanelProps {
  user: any;
  onUpdateProfile: (name: string, email: string) => void;
}

export default function SettingsPanel({ user, onUpdateProfile }: SettingsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'alerts' | 'keys' | 'users' | 'feeds' | 'theme'>('profile');

  // Subsection 1: Profile states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('password');
  const [successMsg, setSuccessMsg] = useState('');

  // Subsection 2: Notification states
  const [notifEmailPrice, setNotifEmailPrice] = useState(true);
  const [notifEmailRating, setNotifEmailRating] = useState(true);
  const [notifEmailNew, setNotifEmailNew] = useState(false);
  const [notifEmailCoupon, setNotifEmailCoupon] = useState(true);
  const [notifSmsRating, setNotifSmsRating] = useState(false);
  const [notifSmsCoupon, setNotifSmsCoupon] = useState(true);

  // Subsection 3: Active API Keys (State-backed with REST APIs)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyFriendlyName, setNewKeyFriendlyName] = useState('');
  const [copiedKeyText, setCopiedKeyText] = useState('');

  // Subsection 4: Team members list (Admin only)
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Rishikesh Brijbhushan Mishra', email: 'rishikeshbrijjbhushanmishra@gmail.com', role: 'admin', status: 'Active' }
  ]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  // Subsection 5: Core Data feeds sources config
  const [dataFeeds, setDataFeeds] = useState<DataSource[]>([
    { id: '1', providerName: 'SEBI Corporate Bond Registry Services', endpointUrl: 'https://api.sebi.gov.in/v2/municipal-bonds', status: 'Connected', refreshIntervalSeconds: 300, lastSyncTime: '2m ago' },
    { id: '2', providerName: 'NSE India Debt Market Feed Node', endpointUrl: 'https://feed.nseindia.com/marketdata/debt-instruments', status: 'Connected', refreshIntervalSeconds: 60, lastSyncTime: '3s ago' },
    { id: '3', providerName: 'BSE India Municipal Ledger Platform', endpointUrl: 'https://bseindia.com/muni-feed/v1', status: 'Degraded', refreshIntervalSeconds: 120, lastSyncTime: '5m ago' }
  ]);

  // Subsection 6: Layout density and cosmetic picker
  const [densityMode, setDensityMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [accentTheme, setAccentTheme] = useState<'orange' | 'blue' | 'classic'>('orange');

  // Query API keys from backend
  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profileEmail);
    setSuccessMsg('Member profile credentials compiled and loaded.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyFriendlyName.trim()) return;

    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyFriendlyName })
      });
      if (res.ok) {
        setNewKeyFriendlyName('');
        fetchApiKeys();
        setSuccessMsg('Dynamic cryptographic API key token successfully generated.');
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/api-keys/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMbr = {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Active'
    };

    setTeamMembers(prev => [...prev, newMbr]);
    setInviteName('');
    setInviteEmail('');
    setSuccessMsg(`Invitation dispatched to ${inviteEmail}.`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const toggleTeammemberState = (emailStr: string) => {
    setTeamMembers(prev => prev.map(m => {
      if (m.email === emailStr) {
        return { ...m, status: m.status === 'Active' ? 'Deactivated' : 'Active' };
      }
      return m;
    }));
  };

  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[500px] select-none text-left">
      
      {/* Settings Navigation sub sidebar tabs */}
      <div className="w-full md:w-56 bg-slate-50 border-r border-slate-150 p-4 shrink-0 space-y-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block px-2 mb-2">Category Sub-menus</span>
        
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'profile' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <User size={14} className="shrink-0" />
          Member Profile
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'alerts' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <BellRing size={14} className="shrink-0" />
          System Notifications
        </button>


        <button
          onClick={() => setActiveSubTab('users')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Users2 size={14} className="shrink-0" />
          Users & Access roles
        </button>

        <button
          onClick={() => setActiveSubTab('feeds')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'feeds' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Database size={14} className="shrink-0" />
          Data feed sources
        </button>

        <button
          onClick={() => setActiveSubTab('theme')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'theme' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Palette size={14} className="shrink-0" />
          Accent Appearance
        </button>
      </div>

      {/* Primary content area panel */}
      <div className="flex-1 p-6 font-sans overflow-y-auto">
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs p-3 rounded-md flex items-center gap-2">
            <CheckCircle size={14} className="shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* PROFILE EDITOR */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Member Account Settings</h4>
              <p className="text-xs text-slate-400 mt-0.5">Customize your verified account information and signatures.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Registered Email address</label>
              <input
                type="email"
                disabled
                value={profileEmail}
                className="w-full text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 rounded p-2.5 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase block">Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold text-slate-450 uppercase block">Terminal Pass Key</label>
                <span className="text-[9px] font-mono text-slate-400 italic">Pre-assigned</span>
              </div>
              <input
                type="password"
                disabled
                value={profilePassword}
                className="w-full text-xs font-mono bg-slate-100 text-slate-400 border border-slate-200 rounded p-2.5 outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-slate-900 border border-slate-950 text-white font-bold text-xs rounded hover:bg-slate-800 cursor-pointer transition-all uppercase"
            >
              Update Account memorandums
            </button>
          </form>
        )}

        {/* SYSTEM NOTIFICATIONS TOGGLES */}
        {activeSubTab === 'alerts' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800">System Notification Triggers</h4>
              <p className="text-xs text-slate-400 mt-0.5">Define automated notifications triggers for yield shifts, rating changes or coupon transfers.</p>
            </div>

            <div className="space-y-4 max-w-lg divide-y divide-slate-105">
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">E-Mail Outgoings</span>
                
                <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">Watchlist Trigger alert notification</p>
                    <p className="text-[10px] text-slate-400">Pushes immediate emails when target bonds hit the specified price thresholds.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEmailPrice}
                    onChange={(e) => setNotifEmailPrice(e.target.checked)}
                    className="accent-orange-500 rounded h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">Agency score rating changes</p>
                    <p className="text-[10px] text-slate-400">Notifies when CRISIL/ICRA triggers upgrades/downgrades on outstanding bonds.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEmailRating}
                    onChange={(e) => setNotifEmailRating(e.target.checked)}
                    className="accent-orange-500 rounded h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">Periodic Coupon dispatch confirmations</p>
                    <p className="text-[10px] text-slate-400">Delivers statements upon final matching schedule clearances.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEmailCoupon}
                    onChange={(e) => setNotifEmailCoupon(e.target.checked)}
                    className="accent-orange-500 rounded h-4 w-4"
                  />
                </label>
              </div>

              <div className="space-y-2.5 pt-4">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SMS Tickers alerts</span>
                
                <label className="flex items-center justify-between text-xs py-1 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">Rating adjustments warning dispatch</p>
                    <p className="text-[10px] text-slate-400">Delivers real-time emergency texts for credit scoring declines.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSmsRating}
                    onChange={(e) => setNotifSmsRating(e.target.checked)}
                    className="accent-orange-500 rounded h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>
        )}


        {/* USERS & ACCESS RULES */}
        {activeSubTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Team Access Control & Authorization</h4>
              <p className="text-xs text-slate-400 mt-0.5">Invite new municipal officers and delegate Roles metrics views permissions.</p>
            </div>

            {/* Invite form */}
            {user?.role === 'admin' ? (
              <form onSubmit={handleInviteUser} className="bg-slate-50 border border-slate-100 rounded-md p-4 flex flex-wrap gap-3 items-end max-w-2xl">
                <div className="flex-1 min-w-[150px] space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Colleague Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sanjay Kumar"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-750 bg-white border border-slate-250 rounded p-1.5 focus:outline-none"
                  />
                </div>

                <div className="flex-1 min-w-[150px] space-y-1 font-sans">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">E-Mail Address</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@bbmp.gov.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-755 bg-white border border-slate-250 rounded p-1.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 min-w-[120px]">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full text-xs border border-slate-250 rounded p-1.5 bg-white text-slate-700 outline-none cursor-pointer font-sans"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="officer">Corp Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer uppercase font-sans"
                >
                  <Plus size={14} className="text-orange-500" />
                  Invite Colleague
                </button>
              </form>
            ) : (
              <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded text-amber-800 text-xs flex items-start gap-2 max-w-lg">
                <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="leading-normal font-medium">Invitation controls restricted. Only users carrying authorized <span className="font-bold">admin</span> level roles can invite registry operators.</p>
              </div>
            )}

            {/* Users list Table */}
            <div className="border border-slate-100 rounded overflow-hidden max-w-3xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-mono font-semibold uppercase text-slate-500 text-[10px]">
                  <tr>
                    <th className="p-3">Verified Operator</th>
                    <th className="p-3">Email Desk</th>
                    <th className="p-3">Permissions Scope</th>
                    <th className="p-3 text-center">Desk Lock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map(mbr => (
                    <tr key={mbr.email} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{mbr.name}</td>
                      <td className="p-3 font-mono font-bold text-slate-500">{mbr.email}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-slate-500 uppercase">
                          {mbr.role}
                        </span>
                      </td>
                      <td className="p-3 text-center select-none">
                        <button
                          onClick={() => toggleTeammemberState(mbr.email)}
                          disabled={user?.role !== 'admin' || mbr.email === user?.email}
                          className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${
                            user?.role !== 'admin' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          } ${
                            mbr.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100/50'
                          }`}
                        >
                          {mbr.status === 'Active' ? 'AUTHORIZED' : 'LOCKED BLOCK'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FEED SOURCES */}
        {activeSubTab === 'feeds' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Dynamic Data Provider integrations</h4>
              <p className="text-xs text-slate-400 mt-0.5">Control live data API feeds. View synchronized interval rates and web socket endpoints configurations.</p>
            </div>

            <div className="space-y-3 max-w-4xl">
              {dataFeeds.map(feed => (
                <div key={feed.id} className="border border-slate-150 rounded-lg p-4 flex items-center justify-between bg-slate-50/20">
                  <div className="space-y-1 text-left min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-800">{feed.providerName}</p>
                      <span className={`inline-block font-mono font-bold text-[9px] px-1.5 rounded uppercase ${
                        feed.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {feed.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-slate-400 truncate">{feed.endpointUrl}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right text-[10px] text-slate-500 font-mono font-semibold">
                      <p className="flex items-center gap-1 justify-end">
                        <Clock size={11} />
                        Sync Rate: {feed.refreshIntervalSeconds}s
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Synced: {feed.lastSyncTime}</p>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700 bg-white border border-slate-200 p-1.5 rounded shadow-sm hover:scale-103 cursor-pointer">
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {activeSubTab === 'theme' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Accent Themes and Density</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tailor grid margins and core UI accent color ranges for custom visual setups.</p>
            </div>

            {/* Density switch */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest block">Dashboard Margin Density</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDensityMode('comfortable')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer border ${
                    densityMode === 'comfortable' ? 'bg-slate-900 border-slate-950 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  Comfortable Spacing
                </button>
                <button
                  onClick={() => setDensityMode('compact')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer border ${
                    densityMode === 'compact' ? 'bg-slate-900 border-slate-950 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  Bloomberg Compact Grid
                </button>
              </div>
            </div>

            {/* Color accent selection */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest block">Cosmetic Accent Palette</span>
              <div className="flex gap-4">
                <button
                  onClick={() => setAccentTheme('orange')}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border rounded cursor-pointer transition-all ${
                    accentTheme === 'orange' ? 'border-orange-500 ring-1 ring-orange-500 font-bold' : 'border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 block"></span>
                  National Saffron (#F97316)
                </button>

                <button
                  onClick={() => setAccentTheme('blue')}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border rounded cursor-pointer transition-all ${
                    accentTheme === 'blue' ? 'border-blue-500 ring-1 ring-blue-500 font-bold' : 'border-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
                  Bloomberg Slate Royal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
