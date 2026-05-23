/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, AlertTriangle, ChevronDown, KeyRound, LogOut, LogIn, ExternalLink } from 'lucide-react';
import { UserProfile, Bond } from '../types';
import { translations, Language } from '../translations';

interface HeaderProps {
  onOpenAuth: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  bonds: Bond[];
  onSelectBond: (bond: Bond) => void;
  activeTab: string;
  language: Language;
}

export default function Header({ onOpenAuth, user, onLogout, bonds, onSelectBond, activeTab, language }: HeaderProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Market Alert', message: 'BMC Bond Series 780-AM28 yield shifted by +0.15%', time: '2m ago', type: 'warning', read: false },
    { id: '2', title: 'System Security', message: 'New administrative terminal login detected from IN-MUM-01', time: '15m ago', type: 'info', read: false },
    { id: '3', title: 'Watchlist Update', message: 'Indore Municipal Green Bonds oversubscribed by 2.4x', time: '1h ago', type: 'success', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Filter bonds for autocomplete search
  const filteredSearchBonds = searchQuery.trim() === ''
    ? []
    : bonds.filter(b => 
        b.corporationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bondId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shortName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

  // Render friendly readable page name
  const pageTitles: Record<string, string> = {
    tracker: 'Municipal Bond Market Screener',
    dashboard: 'Capital & Yield Revenue Dashboard',
    locator: 'National Corporation Choropleth Map',
    settings: 'Settings',
    admin: 'Staff Audits & Core Ledgers'
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 select-none shrink-0">
      {/* Left Breadcrumbs and dynamic labels */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400">
          <span>MuniBond India</span>
          <span>/</span>
          <span className="text-orange-500">{activeTab === 'revenue' ? 'revenue' : activeTab}</span>
        </div>
        <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
          {pageTitles[activeTab] || 'Municipal Intelligence Platform'}
        </h2>
      </div>

      {/* Center Search bar with Autocomplete */}
      <div className="w-80 relative">
        <div className="relative">
          <input
            type="text"
            placeholder={t.search_placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans"
          />
          <Search size={13} className="absolute left-3 top-2.5 text-slate-450" />
        </div>

        {/* Autocomplete Results Panel */}
        {showResults && filteredSearchBonds.length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-white border border-slate-100 rounded-md shadow-2xl z-50 p-2 text-xs divide-y divide-slate-50 max-h-80 overflow-y-auto">
            <span className="text-[9px] uppercase tracking-wider font-mono font-semibold text-slate-400 block px-2.5 py-1.5 uppercase bg-slate-50 mb-1">
              Top Bonds Matching Search
            </span>
            {filteredSearchBonds.map(bond => (
              <button
                key={bond.id}
                onMouseDown={() => {
                  onSelectBond(bond);
                  setSearchQuery('');
                }}
                className="w-full text-left p-2.5 hover:bg-slate-50 rounded flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-slate-700 font-sans">{bond.corporationName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-100 px-1 rounded">{bond.bondId}</span>
                    <span className="text-slate-400">{bond.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">₹{bond.currentPrice.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600 font-bold font-mono">YTM {bond.yieldPercent}%</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right control utilities (Bell + Avatar Profile Menu) */}
      <div className="flex items-center gap-3">
        {/* Connection status bulb */}
        <div className="flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          LIVE FEED
        </div>

        {/* Info alerts bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
            className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 bg-white border border-slate-100 rounded-lg shadow-2xl z-50 w-80 text-xs overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Notifications</span>
                <div className="flex gap-3">
                  <button onClick={markAllAsRead} className="text-[10px] text-orange-600 font-bold hover:underline">Read All</button>
                  <button onClick={clearNotifications} className="text-[10px] text-slate-400 font-bold hover:text-slate-600">Clear</button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 italic">
                    No active system alerts.
                  </div>
                ) : (
                  notifications.map(note => (
                    <div key={note.id} className={`p-4 hover:bg-slate-50 transition-colors relative ${!note.read ? 'bg-orange-50/20' : ''}`}>
                      {!note.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                          note.type === 'warning' ? 'bg-amber-500' :
                          note.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 flex items-center justify-between">
                            {note.title}
                            <span className="font-mono text-[9px] text-slate-400">{note.time}</span>
                          </p>
                          <p className="text-slate-500 leading-normal mt-0.5">{note.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto">
                  VIEW AUDIT LOGS
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User context action dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 hover:bg-slate-50 px-2.5 py-1.5 border border-slate-100 rounded text-xs transition-colors cursor-pointer text-slate-700 font-medium"
          >
            {user ? (
              <>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px] uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown size={12} className="text-slate-400 shrink-0" />
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-orange-600 font-semibold uppercase tracking-wider text-[10px]">
                <LogIn size={13} />
                Access Console
              </span>
            )}
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-11 bg-white border border-slate-100 rounded shadow-2xl z-50 p-2 w-48 text-xs divide-y divide-slate-100">
              {user ? (
                <>
                  <div className="px-2.5 py-2">
                    <p className="font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate tracking-wide mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded text-slate-600 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <KeyRound size={13} className="text-slate-400" />
                      Session & security
                    </button>
                    {user.role === 'admin' && (
                      <div className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono text-emerald-600 bg-emerald-50 rounded my-1 font-bold">
                        ★ System Admin
                      </div>
                    )}
                  </div>
                  <div className="pt-1 select-none">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-rose-50 text-rose-600 rounded flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut size={13} />
                      Revoke workspace
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center py-2 bg-slate-900 text-white hover:bg-slate-900 rounded font-bold cursor-pointer transition-colors block text-[11px]"
                  >
                    Authenticate Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
