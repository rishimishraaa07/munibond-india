/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  TrendingUp,
  Map,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';
import { translations, Language } from '../translations';
import logo from '../../images/munibond.jpg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  language: Language;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  user,
  onOpenAuth,
  language
}: SidebarProps) {
  const t = translations[language];

  const menuItems = [
    { id: 'tracker', label: t.bond_screener, icon: TrendingUp },
    { id: 'dashboard', label: t.revenue_analytics, icon: Briefcase },
    { id: 'locator', label: t.corporation_map, icon: Map },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  // Admin access items
  const adminItems = [
    { id: 'admin', label: t.admin_console, icon: ShieldCheck }
  ];

  return (
    <aside
      className={`bg-[#0F172A] border-r border-slate-800 flex flex-col transition-all duration-300 relative select-none ${
        collapsed ? 'w-16' : 'w-64'
      } z-20 h-full text-slate-200`}
    >
      {/* Platform Branding Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center shrink-0">
              <img src="/images/munibond.jpg" alt="MuniBond Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-tight uppercase">MUNIBOND</span>
              <span className="text-orange-500 text-[10px] font-medium tracking-widest uppercase">India Intelligence</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto select-none font-bold text-orange-500 h-8 w-8 rounded overflow-hidden flex items-center justify-center border border-slate-800 text-sm">
            <img src="/images/munibond.jpg" alt="M" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Toggle Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-13 text-slate-400 bg-[#0F172A] border border-slate-800 hover:bg-slate-800 hover:text-white p-1 rounded-full z-30 transition-colors shadow-lg cursor-pointer"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto mt-4">
        {!collapsed && (
          <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-slate-500 block mb-2 px-3">
            Platform Modules
          </span>
        )}
        
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          return (
            <button
               key={item.id}
               onClick={() => {
                 if (item.id === 'dashboard') {
                   setActiveTab('revenue');
                 } else {
                   setActiveTab(item.id);
                 }
               }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 cursor-pointer text-sm ${
                isActive || (item.id === 'dashboard' && activeTab === 'revenue')
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <IconComponent size={16} className={isActive || (item.id === 'dashboard' && activeTab === 'revenue') ? 'text-orange-500' : 'text-slate-400'} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {/* Administration Section */}
        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-800 mt-4 space-y-1.5">
            {!collapsed && (
              <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-slate-500 block mb-2 px-3">
                Staff Access
              </span>
            )}
            {adminItems.map(item => {
              const isActive = activeTab === item.id;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 cursor-pointer text-sm ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <IconComponent size={16} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        )}
      </nav>


    </aside>
  );
}
