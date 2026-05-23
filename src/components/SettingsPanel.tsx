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
  RefreshCw,
  Languages,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsPanelProps {
  user: any;
  onUpdateProfile: (name: string, email: string, avatarUrl?: string, role?: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language: 'en' | 'hi' | 'mr' | 'kn';
  setLanguage: (val: 'en' | 'hi' | 'mr' | 'kn') => void;
  timeZone: string;
  setTimeZone: (val: string) => void;
  accentTheme: 'orange' | 'blue' | 'classic';
  setAccentTheme: (val: 'orange' | 'blue' | 'classic') => void;
  densityMode: 'compact' | 'comfortable';
  setDensityMode: (val: 'compact' | 'comfortable') => void;
}

export default function SettingsPanel({ 
  user, 
  onUpdateProfile,
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  timeZone,
  setTimeZone,
  accentTheme,
  setAccentTheme,
  densityMode,
  setDensityMode
}: SettingsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'alerts' | 'keys' | 'theme' | 'localization'>('profile');

  // Subsection 1: Profile states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl || '');
  const [profileRole, setProfileRole] = useState(user?.role || 'viewer');
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

  // Subsection 6: Layout density and cosmetic picker
  // (State moved to App.tsx for global application)

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
    onUpdateProfile(profileName, profileEmail, profileAvatar, profileRole);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          onClick={() => setActiveSubTab('theme')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'theme' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Palette size={14} className="shrink-0" />
          Accent Appearance
        </button>

        <button
          onClick={() => setActiveSubTab('localization')}
          className={`w-full text-left text-xs px-2.5 py-2 rounded flex items-center gap-2 font-semibold transition-all cursor-pointer ${
            activeSubTab === 'localization' ? 'bg-slate-900 text-orange-500' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Languages size={14} className="shrink-0" />
          Localization & UX
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

            {/* Avatar Selection */}
            <div className="flex items-center gap-4 py-4 border-b border-slate-100 mb-2">
              <div className="relative group">
                {profileAvatar ? (
                  <img src={profileAvatar} className="h-20 w-20 rounded-full object-cover border-2 border-orange-500 shadow-lg transition-transform group-hover:scale-105" alt="Preview" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                    <User size={32} className="text-slate-300" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Profile Authentication Image</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                    <Plus size={14} className="text-orange-500" />
                    Change Photo
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </label>
                  
                  {profileAvatar && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatar('')}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[11px] font-bold rounded hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic">Supports JPG, PNG or WEBP. Max size 2MB.</p>
              </div>
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
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase block">Assigned Role</label>
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5 focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="admin">Administrator</option>
                <option value="officer">Municipal Officer</option>
                <option value="analyst">Financial Analyst</option>
                <option value="viewer">Market Viewer</option>
              </select>
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

        {/* LOCALIZATION & UX */}
        {activeSubTab === 'localization' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Regional & Personalization Settings</h4>
              <p className="text-xs text-slate-400 mt-0.5">Adjust terminal language, time-zone, and visual comfort modes.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              {/* Language Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Terminal Interface Language</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'en', label: 'English (Global)' },
                    { id: 'hi', label: 'Hindi (हिंदी)' },
                    { id: 'mr', label: 'Marathi (मराठी)' },
                    { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded border text-left flex items-center justify-between ${
                        language === lang.id ? 'bg-slate-900 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lang.label}
                      {language === lang.id && <CheckCircle size={12} className="text-orange-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Data Synchronization Timezone</span>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded p-2.5 bg-white text-slate-700 outline-none cursor-pointer"
                >
                  <option value="IST">India Standard Time (IST) - GMT+5:30</option>
                  <option value="GMT">Greenwich Mean Time (GMT) - GMT+0:00</option>
                  <option value="EST">Eastern Standard Time (EST) - GMT-5:00</option>
                  <option value="PST">Pacific Standard Time (PST) - GMT-8:00</option>
                </select>
              </div>

              {/* Dark Mode Toggle */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Visual Comfort Mode</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon size={18} className="text-orange-400" /> : <Sun size={18} className="text-orange-500" />}
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-tight">Dark Terminal Mode</p>
                      <p className="text-[10px] text-slate-400 font-medium">Reduce eye strain for late-night analytics.</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-orange-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
