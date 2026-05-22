/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StateMetrics } from '../types';
import { CORPORATIONS_CATALOG } from '../data';
import {
  MapPin,
  Building2,
  Users2,
  CalendarDays,
  Globe2,
  Mail,
  Search,
  Sliders,
  Grid,
  Map,
  TableProperties,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

interface CorporationLocatorProps {
  stateMetrics: StateMetrics[];
}

export default function CorporationLocator({ stateMetrics }: CorporationLocatorProps) {
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [shadeMetric, setShadeMetric] = useState<'VALUE' | 'YIELD' | 'RISK'>('VALUE');
  const [searchCorpQuery, setSearchCorpQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedCorp, setSelectedCorp] = useState<any>(null);

  // States coordinates for geometric schematic map representation of India (highly robust, responsive, offline)
  const mapNodes = [
    // NORTH
    { name: 'Jammu & Kashmir', left: '26%', top: '6%', region: 'NORTH' },
    { name: 'Himachal Pradesh', left: '30%', top: '12%', region: 'NORTH' },
    { name: 'Punjab', left: '24%', top: '16%', region: 'NORTH' },
    { name: 'Uttarakhand', left: '34%', top: '16%', region: 'NORTH' },
    { name: 'Haryana', left: '26%', top: '22%', region: 'NORTH' },
    { name: 'Delhi', left: '32%', top: '22%', region: 'NORTH' },
    { name: 'Uttar Pradesh', left: '42%', top: '24%', region: 'NORTH' },

    // WEST
    { name: 'Rajasthan', left: '16%', top: '25%', region: 'WEST' },
    { name: 'Gujarat', left: '12%', top: '35%', region: 'WEST' },
    { name: 'Maharashtra', left: '24%', top: '48%', region: 'WEST' },
    { name: 'Goa', left: '20%', top: '64%', region: 'WEST' },

    // CENTRAL
    { name: 'Madhya Pradesh', left: '30%', top: '34%', region: 'CENTRAL' },
    { name: 'Chhattisgarh', left: '44%', top: '42%', region: 'CENTRAL' },

    // EAST
    { name: 'Bihar', left: '52%', top: '24%', region: 'EAST' },
    { name: 'Jharkhand', left: '52%', top: '32%', region: 'EAST' },
    { name: 'Odisha', left: '48%', top: '45%', region: 'EAST' },
    { name: 'West Bengal', left: '60%', top: '30%', region: 'EAST' },
    { name: 'Assam', left: '74%', top: '18%', region: 'EAST' },

    // SOUTH
    { name: 'Karnataka', left: '24%', top: '68%', region: 'SOUTH' },
    { name: 'Telangana', left: '36%', top: '56%', region: 'SOUTH' },
    { name: 'Andhra Pradesh', left: '36%', top: '66%', region: 'SOUTH' },
    { name: 'Tamil Nadu', left: '32%', top: '82%', region: 'SOUTH' },
    { name: 'Kerala', left: '24%', top: '80%', region: 'SOUTH' }
  ];

  // Helper to resolve State's choropleth color shading matching chosen metric
  const getStateChoroplethClass = (stateName: string) => {
    const metric = stateMetrics.find(m => m.state.toLowerCase() === stateName.toLowerCase());
    if (!metric || metric.totalBondsOutstanding === 0) {
      return 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400';
    }

    if (shadeMetric === 'VALUE') {
      const val = metric.totalFundsRaisedCr;
      if (val >= 1000) return 'bg-orange-600 border-orange-850 hover:bg-orange-500 text-white shadow-sm';
      if (val >= 300) return 'bg-orange-350 border-orange-450 hover:bg-orange-300 text-orange-950';
      return 'bg-orange-100 border-orange-200 hover:bg-orange-150 text-orange-900';
    }

    if (shadeMetric === 'YIELD') {
      const yld = metric.avgYield;
      if (yld >= 8.2) return 'bg-slate-900 border-slate-950 hover:bg-slate-800 text-orange-500 shadow-sm';
      if (yld >= 7.8) return 'bg-slate-700 border-slate-800 hover:bg-slate-600 text-slate-100';
      return 'bg-slate-300 border-slate-400 hover:bg-slate-250 text-slate-800';
    }

    if (shadeMetric === 'RISK') {
      const rsk = metric.riskFactor;
      if (rsk >= 3) return 'bg-rose-600 border-rose-800 hover:bg-rose-500 text-white shadow-sm';
      if (rsk === 2) return 'bg-amber-450 border-amber-500 hover:bg-amber-400 text-slate-900';
      return 'bg-emerald-55 border-emerald-600 hover:bg-emerald-500 text-white';
    }

    return 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400';
  };

  // Resolve Metric textual indicators
  const getShadeMetricValue = (st: string) => {
    const metric = stateMetrics.find(m => m.state === st);
    if (!metric) return '';
    if (shadeMetric === 'VALUE') return `₹${metric.totalFundsRaisedCr} Cr`;
    if (shadeMetric === 'YIELD') return metric.avgYield > 0 ? `YTM ${metric.avgYield}%` : 'N/A';
    if (shadeMetric === 'RISK') return `Risk ${metric.riskFactor}/5`;
    return '';
  };

  // Filter list of corporations by search bar and selected clickable states
  const filteredCorporations = CORPORATIONS_CATALOG.filter(corp => {
    const matchesSearch =
      corp.name.toLowerCase().includes(searchCorpQuery.toLowerCase()) ||
      corp.short.toLowerCase().includes(searchCorpQuery.toLowerCase()) ||
      corp.state.toLowerCase().includes(searchCorpQuery.toLowerCase());

    const matchesStateSelect = !selectedState || corp.state === selectedState;

    return matchesSearch && matchesStateSelect;
  });

  return (
    <div className="space-y-6 select-none text-left font-sans">
      {/* Sub menu controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        {/* Search tool */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Find corporations (e.g. BBMP, Mumbai, Bangalore)..."
            value={searchCorpQuery}
            onChange={(e) => setSearchCorpQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 focus:border-orange-500 focus:outline-none rounded-md bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <Search size={13} className="absolute left-2.5 top-3.5 text-slate-400" />
        </div>

        {/* Filters and View toggles */}
        <div className="flex flex-wrap items-center gap-4">
          {viewMode === 'MAP' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-md text-[10px] font-sans font-bold shadow-sm">
              <span className="text-slate-400 px-2 block select-none uppercase tracking-wider text-[9px]">SHADE STATES BY:</span>
              <button
                onClick={() => setShadeMetric('VALUE')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  shadeMetric === 'VALUE' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                BOND VALUE
              </button>
              <button
                onClick={() => setShadeMetric('YIELD')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  shadeMetric === 'YIELD' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                AVG YIELD
              </button>
              <button
                onClick={() => setShadeMetric('RISK')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  shadeMetric === 'RISK' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                RISK ESTIMATE
              </button>
            </div>
          )}

          {/* Switch layouts tabs */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 p-1 rounded-md text-[10px] font-sans font-bold shadow-sm">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'MAP' ? 'bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Map size={12} />
              MAP VIEW
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'LIST' ? 'bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <TableProperties size={12} />
              STATE DATA LIST
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'MAP' ? (
        /* MAP AND SIDEBAR BENTO ROW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* INTERACTIVE GEOGRAPHIC SCHEMATIC INDIA MAP CANVAS */}
          <div className="bg-slate-900 border border-slate-950 p-5 rounded-lg lg:col-span-2 text-center h-[520px] relative overflow-hidden flex flex-col justify-between shadow-inner select-none">
            
            {/* Header detail watermark */}
            <div className="flex items-start justify-between relative z-10">
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block">Choropleth Engine</span>
                <h4 className="text-sm font-bold text-white tracking-tight leading-normal">
                  Sovereign India Bond Density Locator Map
                </h4>
              </div>
              <div className="text-[10px] font-mono text-slate-500 border border-slate-800 bg-slate-900/60 px-2.5 py-1 rounded">
                Shading: <span className="font-bold text-orange-500 uppercase">{shadeMetric}</span>
              </div>
            </div>

            {/* Micro Legenda floating */}
            <div className="absolute bottom-5 left-5 text-[10px] font-mono font-bold text-slate-500 bg-slate-950/80 border border-slate-900 rounded p-2 text-left space-y-1 z-30">
              <p className="uppercase text-[9px] text-slate-500 border-b border-slate-900 pb-1 mb-1 tracking-wider">Metirc Intensity</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-orange-600 rounded"></span>
                <span>High Threshold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-orange-350 rounded"></span>
                <span>Mid Concentration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-100 rounded"></span>
                <span>Incipient Allocations</span>
              </div>
            </div>

            {/* The clickable geographic grid */}
            <div className="flex-1 w-full relative group py-4">
              {/* Draw connections curves behind pins */}
              <svg className="absolute inset-0 w-full h-full text-slate-800 stroke-[0.35] opacity-25 pointer-events-none">
                {/* draw linking strings between major states centroids */}
                <line x1="26%" y1="6%" x2="30%" y2="12%" stroke="currentColor" />
                <line x1="24%" y1="16%" x2="30%" y2="12%" stroke="currentColor" />
                <line x1="24%" y1="16%" x2="16%" y2="25%" stroke="currentColor" />
                <line x1="16%" y1="25%" x2="12%" y2="35%" stroke="currentColor" />
                <line x1="12%" y1="35%" x2="24%" y2="48%" stroke="currentColor" />
                <line x1="24%" y1="48%" x2="24%" y2="68%" stroke="currentColor" />
                <line x1="24%" y1="68%" x2="32%" y2="82%" stroke="currentColor" />
                <line x1="32%" y1="82%" x2="24%" y2="80%" stroke="currentColor" />
              </svg>

              {mapNodes.map(node => {
                const isActive = selectedState === node.name;
                const isShdedClass = getStateChoroplethClass(node.name);
                const customVal = getShadeMetricValue(node.name);

                return (
                  <button
                    key={node.name}
                    onClick={() => {
                      setSelectedState(node.name);
                      setSelectedCorp(null);
                    }}
                    style={{ left: node.left, top: node.top }}
                    className={`absolute p-2.5 rounded-md text-left transition-all duration-155 transform hover:-translate-y-0.5 hover:scale-103 cursor-pointer border select-none group/node min-w-[70px] ${isShdedClass} ${
                      isActive ? 'ring-2 ring-orange-500 bg-orange-65 text-slate-900 border-orange-500 scale-103 z-20 shadow-xl shadow-orange-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 font-sans">
                      <MapPin size={10} className={`${isActive ? 'text-orange-600' : 'text-slate-400 group-hover/node:text-slate-800'}`} />
                      <span className="font-bold text-[10px] tracking-tight truncate max-w-[80px]">{node.name}</span>
                    </div>
                    {customVal && (
                      <span className="font-mono text-[9px] block font-bold leading-none mt-1 opacity-85">
                        {customVal}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Click assistance warning footer */}
            <div className="text-[10px] font-mono font-bold text-slate-500 border-t border-slate-900/50 pt-2 shrink-0">
              ✔ Click on any geographical State Node to reveal active municipal issuing corporations in that zone.
            </div>

          </div>

          {/* SIDEBAR CORPORATIONS LIST AND PINS CARD DETAIL */}
          <div className="space-y-4">
            
            {/* Clicked state indexer summary */}
            <div className="bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">{selectedState || 'All India'} Municipal Index</h4>
                  <p className="text-[10px] text-slate-400">Showing active financial issuers in chosen region.</p>
                </div>
              </div>

              {/* Collapsed clickable corporations list */}
              <div className="space-y-1.5 mt-4 max-h-[140px] overflow-y-auto">
                {filteredCorporations.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-2 text-center">No active municipal paper records found in {selectedState}.</p>
                ) : (
                  filteredCorporations.map(corp => (
                    <button
                      key={corp.name}
                      onClick={() => setSelectedCorp(corp)}
                      className={`w-full text-left text-xs p-2.5 rounded hover:bg-slate-50 border transition-all flex items-center justify-between cursor-pointer ${
                        selectedCorp?.name === corp.name ? 'border-orange-200 bg-orange-50/15 text-orange-950 font-semibold' : 'border-slate-100'
                      }`}
                    >
                      <span className="truncate">{corp.name}</span>
                      <span className="font-mono font-bold text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded">{corp.short}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* DYNAMIC CARD DETAIL OF ISSUING CORPORATION */}
            {selectedCorp ? (
              <div className="bg-slate-950 text-white rounded-lg p-5 border border-slate-950 relative overflow-hidden shadow-2xl animate-fadeIn space-y-4">
                
                {/* Visual orange banner marker */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400"></div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[9px] font-mono leading-none text-slate-500 uppercase tracking-widest font-bold">
                    <span>Municipal Registry Corp</span>
                    <span>-</span>
                    <span className="text-orange-500">{selectedCorp.short}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{selectedCorp.name}</h4>
                  <p className="text-[10px] font-mono font-bold text-slate-400 inline-block bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    Sovereign rating: {selectedCorp.rating}
                  </p>
                </div>

                {/* Grid metrics details */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-b border-slate-900 py-3.5 select-text">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays size={10} />
                      Established
                    </span>
                    <p className="text-xs font-bold text-slate-350">{selectedCorp.est} AD</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Users2 size={10} />
                      Civic Base
                    </span>
                    <p className="text-xs font-bold text-slate-350">{selectedCorp.popServed} Served</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Bonds outstanding</span>
                    <p className="text-xs font-bold text-orange-500 font-mono">{selectedCorp.bondsCount} Series issued</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Funds Mobilized</span>
                    <p className="text-xs font-bold text-emerald-500 font-mono">₹{selectedCorp.totalFundsCr} Cr</p>
                  </div>
                </div>

                {/* Registry Links details */}
                <div className="space-y-2 text-[10px] text-slate-400 font-mono select-none">
                  <a
                    href={selectedCorp.website}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Globe2 size={12} className="text-slate-500 shrink-0" />
                    <span className="truncate hover:underline">{selectedCorp.website.replace('https://', '')}</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-500 shrink-0" />
                    <span className="truncate">{selectedCorp.contact}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-lg text-center text-slate-400 italic text-xs">
                <Building2 size={24} className="mx-auto text-slate-300 mb-2" />
                <p>Select a municipal agency to evaluate detailed civic population served counts, capital funds raised, and direct mail contacts.</p>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* SORTABLE DATA LIST VIEW TABLE */
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden overflow-x-auto select-text font-sans">
          <table className="w-full text-left text-xs border-collapse divide-y divide-slate-100">
            <thead className="bg-slate-50 font-mono font-semibold uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Corporate Sate / Territory Series</th>
                <th className="p-3.5 text-center">Active Issuing series</th>
                <th className="p-3.5 text-right font-mono">Capital Raised (₹ Crores)</th>
                <th className="p-3.5 text-right font-mono">Weighted Yield YTM</th>
                <th className="p-3.5 text-center">State Risk Factor</th>
                <th className="p-3.5 text-right font-mono">Est Probability of default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stateMetrics.map(st => (
                <tr key={st.state} className="hover:bg-slate-50">
                  <td className="p-3.5 pl-5 font-bold text-slate-800">{st.state}</td>
                  <td className="p-3.5 text-center font-mono">{st.totalBondsOutstanding} Series</td>
                  <td className="p-3.5 text-right font-mono font-semibold text-slate-600">₹{st.totalFundsRaisedCr} Cr</td>
                  <td className="p-3.5 text-right font-mono text-orange-600 font-bold">{st.avgYield > 0 ? `${st.avgYield}%` : 'N/A'}</td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      st.riskFactor === 1
                        ? 'bg-emerald-50 text-emerald-600'
                        : st.riskFactor === 2
                        ? 'bg-blue-50 text-blue-600'
                        : st.riskFactor === 3
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      Level {st.riskFactor}/5
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold text-slate-500">{st.defaultProbabilityPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
