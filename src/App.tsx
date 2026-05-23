/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bond, StateMetrics, LiveTransaction, UserProfile, AuditLogEntry } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LiveTicker from './components/LiveTicker';
import BondTracker from './components/BondTracker';
import RevenueDashboard from './components/RevenueDashboard';
import CorporationLocator from './components/CorporationLocator';
import SettingsPanel from './components/SettingsPanel';
import AdminConsole from './components/AdminConsole';
import AuthModule from './components/AuthModule';
import AuthPage from './components/AuthPage';

export default function App() {
  // Authentication status with default administrator credentials initialized for instantaneous access
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Attempt local restoring
    const saved = localStorage.getItem('mb_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('mb_token'));
  const [activeTab, setActiveTab] = useState<string>('tracker');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core municipal registers state
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [liveTx, setLiveTx] = useState<LiveTransaction[]>([]);
  const [stateMetrics, setStateMetrics] = useState<StateMetrics[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('mb_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Localization and UX states
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('mb_theme') === 'dark');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr' | 'kn'>(() => (localStorage.getItem('mb_lang') as any) || 'en');
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('mb_timezone') || 'IST');
  const [accentTheme, setAccentTheme] = useState<'orange' | 'blue' | 'classic'>(() => (localStorage.getItem('mb_accent') as any) || 'orange');
  const [densityMode, setDensityMode] = useState<'compact' | 'comfortable'>(() => (localStorage.getItem('mb_density') as any) || 'comfortable');

  // Effect to apply theme and persist settings
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mb_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentTheme);
    localStorage.setItem('mb_accent', accentTheme);
  }, [accentTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', densityMode);
    localStorage.setItem('mb_density', densityMode);
  }, [densityMode]);

  useEffect(() => {
    localStorage.setItem('mb_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mb_timezone', timeZone);
  }, [timeZone]);

  // Trigger load of all initial lists from backend APIs
  const fetchAllInitialData = async () => {
    try {
      const resBonds = await fetch('/api/bonds');
      if (resBonds.ok) {
        const data = await resBonds.json();
        setBonds(data);
      }

      const resMetrics = await fetch('/api/revenue/state-metrics');
      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setStateMetrics(data);
      }

      const resLogs = await fetch('/api/auth/audit-logs');
      if (resLogs.ok) {
        const data = await resLogs.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Handshake fetching aggregates failed:', err);
    }
  };

  useEffect(() => {
    fetchAllInitialData();
  }, []);

  // Set up real-time Server Sent Events channel to receive simulated feeds ticks
  useEffect(() => {
    setConnectionStatus('connecting');
    const eventSource = new EventSource('/api/bonds/live');

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'HOLDINGS_INIT') {
          setBonds(payload.bonds);
          setLiveTx(payload.transactions || []);
        } else if (payload.type === 'MARKET_TICK') {
          // Highlight fluctuating rows via direct price ticks
          setBonds(payload.bonds);
        } else if (payload.type === 'TRADE') {
          setBonds(payload.bonds);
          if (payload.tx) {
            setLiveTx(prev => [payload.tx, ...prev].slice(0, 50));
          }
        }
      } catch (err) {
        console.error('Failed processing stream:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('Real-time connection interrupted. Enforcing backup pollers.', err);
      setConnectionStatus('disconnected');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Clean-room backup poller to safeguard dashboard consistency in sandboxed networks
  useEffect(() => {
    if (connectionStatus === 'connected') return;

    // Trigger immediate standard poll interval to feed updates
    const backupPoller = setInterval(async () => {
      try {
        const res = await fetch('/api/bonds');
        if (res.ok) {
          const data = await res.json();
          setBonds(data);
        }
      } catch (err) {
        console.warn('Backup polling error:', err);
      }
    }, 4000);

    return () => clearInterval(backupPoller);
  }, [connectionStatus]);

  // Synchronize state metrics with each live bond changes
  useEffect(() => {
    if (bonds.length === 0) return;
    const fetchFreshMetrics = async () => {
      try {
        const res = await fetch('/api/revenue/state-metrics');
        if (res.ok) {
          const data = await res.json();
          setStateMetrics(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFreshMetrics();
  }, [bonds]);

  // Watchlist configuration persistence
  const toggleWatchlist = (bondIdStr: string) => {
    setWatchlist(prev => {
      const updated = prev.includes(bondIdStr)
        ? prev.filter(id => id !== bondIdStr)
        : [...prev, bondIdStr];
      localStorage.setItem('mb_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Submit target Alerting bounds to server
  const handleCreateAlertConfig = async (alert: { bondId: string; targetPrice: number; type: string; email: boolean }) => {
    try {
      const res = await fetch('/api/bonds/alert-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert })
      });
      if (res.ok) {
        // reload logs
        const logsRes = await fetch('/api/auth/audit-logs');
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setAuditLogs(lData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Bond series (Admin Console)
  const handlePublishNewBond = async (bondPayload: Partial<Bond>): Promise<boolean> => {
    try {
      const res = await fetch('/api/bonds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bond: bondPayload })
      });
      if (res.ok) {
        fetchAllInitialData();
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  const handleUserLogin = (userProfile: UserProfile, token: string) => {
    setUser(userProfile);
    setAuthToken(token);
    localStorage.setItem('mb_user', JSON.stringify(userProfile));
    localStorage.setItem('mb_token', token);
    fetchAllInitialData();
  };

  const handleUserLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-session-id': 'SES-001' }
      });
    } catch {
      // ignore
    }
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('mb_user');
    localStorage.removeItem('mb_token');
    setActiveTab('auth');
  };

  const MUNI_NEWS = [
    { id: 'NW-001', text: 'Indore Municipal Corporation listed and oversubscribed green bonds worth 244Cr.', severity: 'high', time: '10m ago' },
    { id: 'NW-002', text: 'SEBI outlines revised transparency policies for state municipal default heatmaps.', severity: 'low', time: '1h ago' },
    { id: 'NW-003', text: 'BMC matches AA+ rating scores based on property tax escrows audit.', severity: 'medium', time: '2h ago' }
  ];

  if (!user) {
    return <AuthPage onLoginSuccess={(u, t) => handleUserLogin(u, t)} />;
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans relative antialiased select-none overflow-hidden">
      
      {/* Top Banner Alert Ticker tape */}
      <LiveTicker bonds={bonds} news={MUNI_NEWS} />

      {/* Main Container Layer */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          user={user}
          onOpenAuth={() => setActiveTab('auth')}
          language={language}
        />

        {/* Master Workspace Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          
          {/* Header context and search bar */}
          <Header
            activeTab={activeTab}
            user={user}
            onLogout={handleUserLogout}
            onOpenAuth={() => setActiveTab('auth')}
            bonds={bonds}
            onSelectBond={setSelectedBond}
            language={language}
          />

          {/* Module Panel Render Router */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <>
              {/* Tracker LEDGER View */}
                {activeTab === 'tracker' && (
                  <BondTracker
                    bonds={bonds}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    selectedBond={selectedBond}
                    setSelectedBond={setSelectedBond}
                    userRole={user.role}
                    onAlertCreate={handleCreateAlertConfig}
                  />
                )}

                {/* Analytical Revenue charts View */}
                {activeTab === 'revenue' && (
                  <RevenueDashboard
                    bonds={bonds}
                    stateMetrics={stateMetrics}
                    liveTx={liveTx}
                  />
                )}

                {/* State Locator Choropleth View */}
                {activeTab === 'locator' && (
                  <CorporationLocator
                    stateMetrics={stateMetrics}
                  />
                )}

                {/* Settings administration control panel */}
                {activeTab === 'settings' && (
                  <SettingsPanel
                    user={user}
                    onUpdateProfile={(name, email, avatarUrl, role) => {
                      const updated = { ...user, name, email };
                      if (avatarUrl) updated.avatarUrl = avatarUrl;
                      if (role) updated.role = role;
                      setUser(updated);
                      localStorage.setItem('mb_user', JSON.stringify(updated));
                    }}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                    language={language}
                    setLanguage={setLanguage}
                    timeZone={timeZone}
                    setTimeZone={setTimeZone}
                    accentTheme={accentTheme}
                    setAccentTheme={setAccentTheme}
                    densityMode={densityMode}
                    setDensityMode={setDensityMode}
                  />
                )}

                {/* Master Admin / Analyst Seeder Console */}
                {activeTab === 'admin' && (
                  <AdminConsole
                    bonds={bonds}
                    onAddBond={handlePublishNewBond}
                    auditLogs={auditLogs}
                  />
                )}

                {/* Authenticated Workspace Users Security Desk view */}
                {activeTab === 'auth' && (
                  <div className="max-w-3xl mx-auto py-4">
                    <AuthModule
                      user={user}
                      onLoginSuccess={(u, t, s) => handleUserLogin(u, t)}
                      onLogout={handleUserLogout}
                      currentSessionId="SES-001"
                      onClose={() => setActiveTab('tracker')}
                      onUpdateUser={(updated) => {
                        setUser(updated);
                        localStorage.setItem('mb_user', JSON.stringify(updated));
                      }}
                    />
                  </div>
                )}
              </>
          </main>

        </div>

      </div>

    </div>
  );
}
