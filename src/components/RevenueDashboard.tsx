/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bond, StateMetrics, LiveTransaction } from '../types';
import {
  TrendingUp,
  Wallet,
  Coins,
  Award,
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  History,
  Calculator,
  Search,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueDashboardProps {
  bonds: Bond[];
  stateMetrics: StateMetrics[];
  liveTx: LiveTransaction[];
}

export default function RevenueDashboard({ bonds, stateMetrics, liveTx }: RevenueDashboardProps) {
  // Calendar filters
  const [dateRange, setDateRange] = useState('ALL-TIME');

  // Comparison module state
  const [compBonds, setCompBonds] = useState<string[]>(['BND-BMC-001', 'BND-BBMP-001', 'BND-IMC-001']);

  // Return Calculator state
  const [selectedCalcBondId, setSelectedCalcBondId] = useState(bonds[0]?.id || '');
  const [investmentAmount, setInvestmentAmount] = useState('500000'); // Default ₹5 Lakhs
  const [durationYears, setDurationYears] = useState(5);

  const selectedCalcBond = bonds.find(b => b.id === selectedCalcBondId) || bonds[0];

  // Calculations
  const calculatedCouponPercent = selectedCalcBond ? selectedCalcBond.couponPercent : 7.80;
  const annualPayout = (parseFloat(investmentAmount) * calculatedCouponPercent) / 100;
  const totalCumulativeEarnings = annualPayout * durationYears;
  const maturityPayout = parseFloat(investmentAmount) + totalCumulativeEarnings;

  // Active KPI summaries
  const totalOutstanding = bonds.length;
  const totalRaisedCr = bonds.reduce((sum, b) => sum + (b.capitalRaisedCr || 0), 0);
  const avgYield = Number((bonds.reduce((sum, b) => sum + b.yieldPercent, 0) / totalOutstanding).toFixed(2));
  const topCorpName = 'Brihanmumbai (BMC)';

  // Category sharing statistics
  const metroRaised = bonds.filter(b => b.category === 'Metro').reduce((acc, b) => acc + b.capitalRaisedCr, 0);
  const tier2Raised = bonds.filter(b => b.category === 'Tier-2').reduce((acc, b) => acc + b.capitalRaisedCr, 0);
  const tier3Raised = bonds.filter(b => b.category === 'Tier-3').reduce((acc, b) => acc + b.capitalRaisedCr, 0);

  const categoryPieData = [
    { name: 'Metro Corporates', value: metroRaised, color: '#f97316' }, // orange
    { name: 'Tier-2 Cities', value: tier2Raised, color: '#0f172a' }, // dark slate
    { name: 'Tier-3 Municipalities', value: tier3Raised, color: '#475569' } // gray
  ];

  // MoM bar chart issuance data
  const momIssuanceData = [
    { month: 'Jun 25', IssuedCr: 120, CumulativeCr: 3100 },
    { month: 'Jul 25', IssuedCr: 210, CumulativeCr: 3310 },
    { month: 'Aug 25', IssuedCr: 80, CumulativeCr: 3390 },
    { month: 'Sep 25', IssuedCr: 150, CumulativeCr: 3540 },
    { month: 'Oct 25', IssuedCr: 310, CumulativeCr: 3850 },
    { month: 'Nov 25', IssuedCr: 190, CumulativeCr: 4040 },
    { month: 'Dec 25', IssuedCr: 240, CumulativeCr: 4280 },
    { month: 'Jan 26', IssuedCr: 350, CumulativeCr: 4630 },
    { month: 'Feb 26', IssuedCr: 200, CumulativeCr: 4830 },
    { month: 'Mar 26', IssuedCr: 550, CumulativeCr: 5380 },
    { month: 'Apr 26', IssuedCr: 180, CumulativeCr: 5560 },
    { month: 'May 26', IssuedCr: 244, CumulativeCr: 5804 }
  ];

  // Coupon payment scheduled simulated list
  const couponSchedules = bonds.slice(0, 5).map((bond, idx) => {
    return {
      id: bond.id,
      series: bond.bondId,
      corp: bond.shortName,
      dueDate: `2026-06-15`,
      valueCr: Number((bond.capitalRaisedCr * (bond.couponPercent / 100)).toFixed(1)),
      frequency: bond.paymentFrequency
    };
  });

  // State default risk heatmap data (top 8 states sorted by risk weight)
  const defaultHeatmap = [...stateMetrics]
    .filter(m => m.totalBondsOutstanding > 0)
    .sort((a, b) => b.riskFactor - a.riskFactor)
    .slice(0, 8);

  const handleToggleCompBond = (id: string) => {
    if (compBonds.includes(id)) {
      setCompBonds(prev => prev.filter(b => b !== id));
    } else {
      if (compBonds.length >= 4) return; // Limit up to 4
      setCompBonds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Date period filters row */}
      <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold font-mono">
          <Calendar size={14} className="text-orange-500 animate-pulse" />
          <span>DATE SCOPE METRICS FILTER:</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 p-1 rounded-md text-[10px] font-mono">
          {['Q1 2026', 'H2 2025', 'PAST 12M', 'ALL-TIME'].map(rng => (
            <button
              key={rng}
              onClick={() => setDateRange(rng)}
              className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                dateRange === rng ? 'bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* Top statistics KPI counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding counts */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Bonds Outstanding</p>
            <h3 className="text-2xl font-bold mt-1.5 text-slate-900 font-mono">₹{totalRaisedCr.toLocaleString('en-IN')} Cr</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-green-600 text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>
            <span>+12.4% vs LY</span>
          </div>
        </div>

        {/* Funds aggregates */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Issuers</p>
            <h3 className="text-2xl font-bold mt-1.5 text-slate-900 font-mono">{totalOutstanding}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-slate-400 text-xs italic font-medium">
            Metro & Tier-2 Combined
          </div>
        </div>

        {/* Global Average Coupon yield */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Avg Market Yield</p>
            <h3 className="text-2xl font-bold mt-1.5 text-slate-900 font-mono">{avgYield}%</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-red-600 text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"/></svg>
            <span>-24bps today</span>
          </div>
        </div>

        {/* Top issuer index */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Investor Volume</p>
            <h3 className="text-2xl font-bold mt-1.5 text-slate-900 font-mono">₹840 Cr</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-green-600 text-[11px] font-semibold">
            <span>Peak Session: {topCorpName.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MoM bond issuances volumes and collections line chart */}
        <div className="bg-white border border-slate-100 rounded-lg p-5 lg:col-span-2 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">Historical Capital Flow & Total Matching Fundings</h3>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-bold uppercase">Crores (INR)</span>
          </div>

          <div className="h-64 font-mono font-bold text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={momIssuanceData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="IssuedCr" fill="#f97316" radius={[2, 2, 0, 0]} name="Value Issued (Cr)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share visualizer pie */}
        <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider mb-2">Category Revenue sharing</h3>
            <p className="text-[10px] text-slate-400 leading-normal mb-4">Relative share of total capital mobilization grouped by municipality categories.</p>
          </div>

          <div className="h-44 font-mono text-[9px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryPieData.map((lbl, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-medium font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full block" style={{ background: lbl.color }}></span>
                  <span className="text-slate-600">{lbl.name}</span>
                </div>
                <span className="font-mono text-slate-800 font-bold">₹{lbl.value} Cr</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investor Returns Calculator & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Returns Yield Calculator */}
        <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5">
            <Calculator size={16} className="text-slate-700 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">Investor Yield Yield Calculator</h3>
          </div>

          <div className="space-y-3.5">
            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">Select Target Bond series</label>
                <select
                  value={selectedCalcBondId}
                  onChange={(e) => setSelectedCalcBondId(e.target.value)}
                  className="w-full text-xs font-sans font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 outline-none cursor-pointer"
                >
                  {bonds.map(b => (
                    <option key={b.id} value={b.id}>{b.shortName} - series ({b.couponPercent}%)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block">Allocation Principal (₹)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 outline-none font-mono"
                />
              </div>
            </div>

            {/* Hold duration slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-slate-450 uppercase">Maturity duration period</span>
                <span className="text-orange-500">{durationYears} Years</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                value={durationYears}
                onChange={(e) => setDurationYears(parseInt(e.target.value))}
                className="w-full accent-orange-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            {/* Calculations results summary */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 grid grid-cols-3 gap-3 text-center select-text">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Base Coupon</span>
                <span className="text-[13px] font-bold font-mono text-slate-700 block mt-1">{calculatedCouponPercent}%</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Annual Return</span>
                <span className="text-[13px] font-bold font-mono text-orange-600 block mt-1">₹{annualPayout.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Total Coupon</span>
                <span className="text-[13px] font-bold font-mono text-emerald-600 block mt-1">₹{totalCumulativeEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Micro warning regarding calculations */}
            <p className="text-[10px] text-slate-400 leading-normal italic select-text">
              ✔ Calculation based on standard compound returns assumption in half-yearly frequency. Backed by escrow assets of the respective corporations.
            </p>
          </div>
        </div>

        {/* State default risk summary heatmap panel */}
        <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">State Fiscal Risk Default Heatmap</h3>
          </div>

          <div className="border border-slate-100 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-mono font-semibold uppercase text-slate-500 text-[10px]">
                <tr>
                  <th className="p-2.5">Sovereign State Union</th>
                  <th className="p-2.5 text-center">Bonds Active</th>
                  <th className="p-2.5 text-right font-mono">Raised (₹ Cr)</th>
                  <th className="p-2.5 text-center">Risk Level Index</th>
                  <th className="p-2.5 text-right font-mono">Prob. of Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                {defaultHeatmap.map(itm => (
                  <tr key={itm.state} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-semibold text-slate-800">{itm.state}</td>
                    <td className="p-2.5 text-center font-mono">{itm.totalBondsOutstanding}</td>
                    <td className="p-2.5 text-right font-mono text-slate-500">₹{itm.totalFundsRaisedCr}</td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                        itm.riskFactor === 1
                          ? 'bg-emerald-50 text-emerald-600'
                          : itm.riskFactor === 2
                          ? 'bg-blue-50 text-blue-600'
                          : itm.riskFactor === 3
                          ? 'bg-amber-55 text-amber-700'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        Level {itm.riskFactor}/5
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600 font-bold">{itm.defaultProbabilityPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* S-B-S Multi-Corporate Comparison Tool Module */}
      <div className="bg-white border border-slate-100 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft size={16} className="text-slate-700 shrink-0" />
            <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">Corporate Metrics Comparison Matrix</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded font-bold uppercase border border-slate-100">
            Compare up to 4 agencies side-by-side
          </span>
        </div>

        {/* Selector chips */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3.5 select-none">
          {bonds.map(b => {
            const isSelected = compBonds.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => handleToggleCompBond(b.id)}
                className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-950 text-orange-500'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {b.shortName} ({b.bondId})
              </button>
            );
          })}
        </div>

        {/* Matrix comparison Table */}
        <div className="border border-slate-100 rounded overflow-hidden overflow-x-auto select-text font-sans">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <tbody>
              {compBonds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 italic">No agencies selected. Toggle the chips above to begin matrix analysis.</td>
                </tr>
              ) : (
                <>
                  <tr className="bg-slate-55 border-b border-slate-100 font-mono font-semibold uppercase text-slate-500 text-[10px]">
                    <td className="p-3 font-bold w-48">Financial metrics series</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return (
                        <td key={id} className="p-3 font-bold text-slate-800">{bObj?.corporationName}</td>
                      );
                    })}
                  </tr>
                  
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Series Code ID</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return <td key={id} className="p-3 font-mono font-bold text-slate-700">{bObj?.bondId}</td>;
                    })}
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Region/State Boundaries</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return <td key={id} className="p-3 text-slate-600 font-medium">{bObj?.state}</td>;
                    })}
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Credit Score Scale</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return (
                        <td key={id} className="p-3">
                          <span className="font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            {bObj?.rating} ({bObj?.ratingAgency})
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Annual coupon Yield %</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return <td key={id} className="p-3 font-mono font-bold text-orange-600 leading-none">{bObj?.couponPercent}%</td>;
                    })}
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Allocated Funding Capital</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return <td key={id} className="p-3 font-mono text-slate-700 font-semibold">₹{bObj?.capitalRaisedCr} Crores</td>;
                    })}
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-500">Maturity Target Date</td>
                    {compBonds.map(id => {
                      const bObj = bonds.find(b => b.id === id);
                      return <td key={id} className="p-3 font-mono text-slate-500">{bObj?.maturityDate}</td>;
                    })}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
