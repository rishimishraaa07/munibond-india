/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bond } from '../types';
import { TrendingUp, TrendingDown, Bell } from 'lucide-react';

interface LiveTickerProps {
  bonds: Bond[];
  news: { id: string; text: string; severity: string; time: string }[];
}

export default function LiveTicker({ bonds, news }: LiveTickerProps) {
  // Extract top movers
  const sortedMovers = [...bonds]
    .filter(b => b.change24h !== 0)
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 10);

  return (
    <div className="bg-slate-900 border-b border-slate-950 text-xs py-1 text-[11px] overflow-hidden flex items-center h-8 relative z-30 select-none">
      <div className="bg-slate-950 text-slate-400 font-bold px-4 py-1.5 text-[9px] tracking-wider uppercase flex items-center gap-2 h-full relative z-40 shrink-0 border-r border-slate-850">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        LIVE TICKER
      </div>

      <div className="w-full flex items-center relative overflow-hidden">
        <div className="animate-ticker flex whitespace-nowrap items-center py-0.5">
          {/* Movers loop */}
          {sortedMovers.map((bond, idx) => {
            const isUp = bond.change24h >= 0;
            return (
              <div
                key={`mover-1-${bond.id}-${idx}`}
                className="inline-flex items-center gap-1.5 mx-6 font-mono text-slate-300"
              >
                <span className="font-semibold text-slate-400">{bond.shortName}</span>
                <span className="text-slate-400">₹{(bond.currentPrice / 1000).toFixed(1)}k</span>
                <span className={`flex items-center font-bold font-mono text-[11px] ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? <TrendingUp size={12} className="shrink-0" /> : <TrendingDown size={12} className="shrink-0" />}
                  {isUp ? '+' : ''}{bond.change24h}%
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-[10px]">YTM: <span className="font-semibold text-slate-300">{bond.yieldPercent}%</span></span>
              </div>
            );
          })}

          {/* News loop interspaced */}
          {news.slice(0, 3).map((n, idx) => (
            <div key={`news-1-${n.id}-${idx}`} className="inline-flex items-center gap-2 mx-6 text-slate-300 font-mono text-[11px]">
              <Bell size={11} className={`${n.severity === 'high' ? 'text-orange-500 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-400 font-semibold uppercase text-[10px] text-slate-500">NEWS:</span>
              <span className="truncate max-w-[300px] text-slate-300">{n.text}</span>
              <span className="text-slate-600 font-normal text-[10px]">{n.time}</span>
            </div>
          ))}

          {/* Repeat for seamless infinite scrolling */}
          {sortedMovers.map((bond, idx) => {
            const isUp = bond.change24h >= 0;
            return (
              <div
                key={`mover-2-${bond.id}-${idx}`}
                className="inline-flex items-center gap-1.5 mx-6 font-mono text-slate-300"
              >
                <span className="font-semibold text-slate-400">{bond.shortName}</span>
                <span className="text-slate-400">₹{(bond.currentPrice / 1000).toFixed(1)}k</span>
                <span className={`flex items-center font-bold font-mono text-[11px] ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? <TrendingUp size={12} className="shrink-0" /> : <TrendingDown size={12} className="shrink-0" />}
                  {isUp ? '+' : ''}{bond.change24h}%
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-[10px]">YTM: <span className="font-semibold text-slate-300">{bond.yieldPercent}%</span></span>
              </div>
            );
          })}

          {news.slice(0, 3).map((n, idx) => (
            <div key={`news-2-${n.id}-${idx}`} className="inline-flex items-center gap-2 mx-6 text-slate-300 font-mono text-[11px]">
              <Bell size={11} className={`${n.severity === 'high' ? 'text-orange-500 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-400 font-semibold uppercase text-[10px] text-slate-500">NEWS:</span>
              <span className="truncate max-w-[300px] text-slate-300">{n.text}</span>
              <span className="text-slate-600 font-normal text-[10px]">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
