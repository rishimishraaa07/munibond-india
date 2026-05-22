/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bond, CreditRating } from '../types';
import {
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  FilePlus,
  Bell,
  Eye,
  Info,
  LineChart,
  Plus,
  ShieldCheck,
  TrendingUp,
  Download,
  Bookmark,
  BellRing
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BondTrackerProps {
  bonds: Bond[];
  watchlist: string[];
  toggleWatchlist: (bondId: string) => void;
  selectedBond: Bond | null;
  setSelectedBond: (bond: Bond | null) => void;
  userRole?: string;
  onAlertCreate: (alert: { bondId: string; targetPrice: number; type: string; email: boolean }) => void;
}

export default function BondTracker({
  bonds,
  watchlist,
  toggleWatchlist,
  selectedBond,
  setSelectedBond,
  userRole,
  onAlertCreate
}: BondTrackerProps) {
  // Navigation filters
  const [filterState, setFilterState] = useState('ALL');
  const [filterRating, setFilterRating] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive bond alert configuring modal states
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('101000');
  const [successToast, setSuccessToast] = useState('');

  // 1D, 1W, 1M, 1Y history tab for charting
  const [historyPeriod, setHistoryPeriod] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');

  // Unique States & Ratings lists for filter selects
  const uniqueStates = Array.from(new Set(bonds.map(b => b.state))).sort();
  const uniqueRatings = Array.from(new Set(bonds.map(b => b.rating))).sort();

  // Filter bonds
  const filteredBonds = bonds.filter(bond => {
    const matchesSearch =
      bond.corporationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bond.bondId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bond.shortName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = filterState === 'ALL' || bond.state === filterState;
    const matchesRating = filterRating === 'ALL' || bond.rating === filterRating;
    const matchesCategory = filterCategory === 'ALL' || bond.category === filterCategory;

    return matchesSearch && matchesState && matchesRating && matchesCategory;
  });

  // Calculate dynamic history chart points based on chosen period and bond variables
  const generateChartData = (bond: Bond, period: string) => {
    const base = bond.currentPrice;
    const pointsCount = period === '1D' ? 12 : period === '1W' ? 7 : period === '1M' ? 15 : 24;
    const step = period === '1D' ? 'Hour' : period === '1W' ? 'Day' : 'Week';

    const data = [];
    let price = base - (pointsCount * 70); // start lower

    for (let i = 0; i < pointsCount; i++) {
      // simulate drift
      price += Math.floor(Math.random() * 200 - 80);
      // tie yield inversely to price movement
      const yieldCalc = Number((bond.yieldPercent * (base / price)).toFixed(2));
      data.push({
        time: `${i + 1} ${step}`,
        Price: price,
        YieldPercent: yieldCalc
      });
    }
    // ensure last matches current price exactly
    data[data.length - 1] = {
      time: `Current`,
      Price: base,
      YieldPercent: bond.yieldPercent
    };

    return data;
  };

  const handleCreatePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBond) return;
    onAlertCreate({
      bondId: selectedBond.bondId,
      targetPrice: parseFloat(alertTargetPrice),
      type: 'PRICE_ABOVE',
      email: true
    });
    setSuccessToast(`Alert trigger dispatched successfully.`);
    setTimeout(() => {
      setSuccessToast('');
      setShowAlertModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Search and interactive Quick filter panels */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-wrap items-center gap-4 justify-between animate-fadeIn">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by Municipal Issuer Name, City, or Bond Series ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none rounded-md bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <Search size={13} className="absolute left-2.5 top-3.5 text-slate-400" />
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterState('ALL');
              setFilterRating('ALL');
              setFilterCategory('ALL');
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 font-mono tracking-wider uppercase border border-slate-200 px-3 py-2.5 rounded-md bg-white hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Categories panel buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'Metro', 'Tier-2', 'Tier-3'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[10px] font-bold px-3 py-2 rounded-md cursor-pointer transition-all ${
                filterCategory === cat
                  ? 'bg-[#0F172A] text-white shadow-sm font-semibold'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {cat === 'ALL' ? 'ALL CATEGORIES' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Select drop-down filter rails */}
      <div className="flex flex-wrap items-center gap-3 text-slate-700 animate-fadeIn">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors">
          <Filter size={12} className="text-slate-400" />
          <span className="text-slate-500">State:</span>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-transparent font-semibold border-none outline-none text-slate-700 block pl-1 cursor-pointer"
          >
            <option value="ALL">All States ({uniqueStates.length})</option>
            {uniqueStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors">
          <ShieldCheck size={12} className="text-slate-400" />
          <span className="text-slate-500">Agency Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-transparent font-semibold border-none outline-none text-slate-700 block pl-1 cursor-pointer"
          >
            <option value="ALL">All Ratings ({uniqueRatings.length})</option>
            {uniqueRatings.map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>

        {/* Dynamic export download buttons */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/api/bonds/export"
            download
            className="text-[10px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md px-3.5 py-2 flex items-center gap-1.5 cursor-pointer font-mono tracking-wider uppercase shadow-sm transition-colors"
          >
            <FileSpreadsheet size={13} className="text-slate-550" />
            Export XLS/CSV
          </a>
          <a
            href="/api/downloads/db-schema"
            download
            className="text-[10px] font-bold bg-[#0F172A] border border-slate-800 text-white rounded-md px-3.5 py-2 flex items-center gap-1.5 cursor-pointer font-mono tracking-wider uppercase shadow-md hover:bg-slate-800 transition-all"
          >
            <Download size={13} className="text-orange-500" />
            PGSQL Seed Set (SQL)
          </a>
        </div>
      </div>

      {/* Primary Price Grid Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto animate-fadeIn">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-sans font-bold tracking-wider uppercase text-[10px]">
              <th className="p-3.5 pl-5 w-10">Select</th>
              <th className="p-3.5">Corporation Name</th>
              <th className="p-3.5 w-32">State</th>
              <th className="p-3.5 w-36">Bond Series ID</th>
              <th className="p-3.5 w-24 text-right">Face Price (₹)</th>
              <th className="p-3.5 w-28 text-right bg-slate-50/50">Current Price (₹)</th>
              <th className="p-3.5 w-20 text-right">Yield (YTM)</th>
              <th className="p-3.5 w-32 text-center">CRISIL/ICRA Rating</th>
              <th className="p-3.5 w-24 text-right">Maturity</th>
              <th className="p-3.5 w-24 text-right">24h Shift</th>
              <th className="p-3.5 w-20 text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredBonds.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-14 text-center text-slate-400 italic font-sans">
                  No sovereign municipal bonds found matching chosen boundaries.
                </td>
              </tr>
            ) : (
              filteredBonds.map(bond => {
                const isSaved = watchlist.includes(bond.id);
                const isUp = bond.change24h >= 0;
                
                return (
                  <tr
                    key={bond.id}
                    className="hover:bg-slate-50 border-b border-slate-100 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedBond(bond)}
                  >
                    {/* Watchlist toggle column */}
                    <td
                      className="p-3.5 pl-5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(bond.id);
                      }}
                    >
                      <button className="text-slate-350 hover:text-orange-500 transition-colors">
                        <Bookmark size={15} className={isSaved ? 'fill-orange-500 text-orange-500' : ''} />
                      </button>
                    </td>

                    {/* Corporation details */}
                    <td className="p-3.5 font-semibold text-slate-800">
                      <div>
                        {bond.corporationName}
                        <span className="ml-2 px-1.5 py-0.2 bg-slate-100 text-[9px] font-bold font-mono text-slate-400 rounded uppercase">
                          {bond.category}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-500">{bond.state}</td>
                    
                    <td className="p-3.5">
                      <span className="font-mono bg-slate-900/5 px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold border border-slate-150">
                        {bond.bondId}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-medium text-slate-500">
                      {bond.faceValue.toLocaleString('en-IN')}
                    </td>

                    {/* Fading active tick transitions columns */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800 bg-slate-50/20 select-text">
                      ₹{bond.currentPrice.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-orange-600 font-bold">
                      {bond.yieldPercent}%
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`inline-block border border-slate-150/80 rounded px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                        bond.rating === 'AAA' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {bond.rating} ({bond.ratingAgency})
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(bond.maturityDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                    </td>

                    {/* Fluctuating changes color guides */}
                    <td className={`p-3.5 text-right font-mono font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isUp ? '+' : ''}{bond.change24h}%
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-slate-500">
                      ₹{bond.volume.toFixed(1)}L
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* BOND DETAIL EXPLORATION MODAL OVERLAY */}
      {selectedBond && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-zoomIn select-none">
            
            {/* Modal Title bar */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">Ledger Details Series</span>
                  <span className="font-mono text-[10px] font-bold bg-slate-800 px-2 py-0.2 rounded text-orange-400">{selectedBond.bondId}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 leading-tight">{selectedBond.corporationName}</h3>
              </div>
              <button
                onClick={() => setSelectedBond(null)}
                className="text-slate-400 hover:text-white font-mono text-xs border border-slate-800 bg-slate-950 hover:border-slate-750 px-2.5 py-1 rounded cursor-pointer transition-colors"
              >
                Close Desk Escape [x]
              </button>
            </div>

            {/* Modal Body scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Core Analytics Blocks Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Yield (YTM)</span>
                  <p className="text-base font-bold text-slate-800 font-mono mt-0.5">{selectedBond.yieldPercent}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Coupon Interest Rate</span>
                  <p className="text-base font-bold text-orange-600 font-mono mt-0.5">{selectedBond.couponPercent}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Agency Credit rating</span>
                  <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">{selectedBond.rating}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-left">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Capital Raised (Total)</span>
                  <p className="text-base font-bold text-slate-800 font-mono mt-0.5">₹{selectedBond.capitalRaisedCr} Crores</p>
                </div>
              </div>

              {/* Charting Module (1D, 1W, 1M, 1Y Period Selection) */}
              <div className="border border-slate-150 rounded-lg p-5 bg-slate-50/50">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <LineChart size={15} />
                    <span>Historical Price & Yield Curve Analytics</span>
                  </div>

                  <div className="flex items-center gap-0.5 bg-white border border-slate-150 p-1 rounded-md text-[10px] font-mono">
                    {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setHistoryPeriod(p)}
                        className={`px-2.5 py-1.5 rounded cursor-pointer font-bold ${
                          historyPeriod === p ? 'bg-slate-900 text-orange-500' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recharts Yield / Price graph representation */}
                <div className="h-60 mt-4 text-[10px] font-mono font-bold select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateChartData(selectedBond, historyPeriod)}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#94a3b8" strokeWidth={1} />
                      <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff' }}
                        cursor={{ stroke: '#334155' }}
                      />
                      <Area type="monotone" dataKey="Price" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#chartGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Description and Funded projects list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Series Memorandum Details</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{selectedBond.description}</p>
                  
                  {/* Tax Status parameters */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-slate-500">TAX STATUS</span>
                    <span className="text-green-600">{selectedBond.taxStatus.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Capital Allocated Infrastructure Projects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBond.projectsFunded.map((proj, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-orange-50 border border-orange-100/50 text-orange-700 px-3 py-1.5 rounded-full"
                      >
                        ✔ {proj}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Watchlist Trigger alert</h5>
                    <button
                      onClick={() => setShowAlertModal(true)}
                      className="text-[10px] font-bold py-1.5 px-3 bg-slate-900 border border-slate-95 w-full rounded flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors text-white cursor-pointer uppercase"
                    >
                      <BellRing size={13} className="text-orange-500 animate-bounce" />
                      Set Price notification alerts
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ALERT POPUP CONFIGURATION MODAL */}
      {showAlertModal && selectedBond && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-lg shadow-2xl p-5 max-w-sm w-full select-none text-left">
            <h4 className="text-sm font-bold text-slate-800">Configure Target Bond Alert</h4>
            <p className="text-xs text-slate-400 mt-1">Configure automated dispatch alerts. Will query pricing and notify via email.</p>
            
            {successToast && (
              <div className="mt-3 bg-emerald-50 text-emerald-600 text-[11px] p-2 rounded-md font-semibold font-sans">
                {successToast}
              </div>
            )}

            <form onSubmit={handleCreatePriceAlert} className="space-y-4 mt-4 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Bond Identity</span>
                <input
                  type="text"
                  disabled
                  value={selectedBond.bondId}
                  className="w-full text-xs border border-slate-200 outline-none rounded p-2 bg-slate-100 font-mono font-bold text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-450 uppercase block">Price above Threshold (₹)</span>
                <input
                  type="number"
                  required
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  className="w-full text-xs font-mono font-bold text-slate-700 border border-slate-200 focus:border-orange-500 focus:outline-none rounded p-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded text-xs cursor-pointer text-center font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded text-xs cursor-pointer text-center font-bold"
                >
                  Establish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
