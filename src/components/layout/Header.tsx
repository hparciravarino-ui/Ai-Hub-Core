import React from 'react';
import { Server, Cpu, Settings } from 'lucide-react';
import { HardwareProfile, PerformanceProfile } from '../../types';

interface HeaderProps {
  offlineOnly: boolean;
  currentHardware: HardwareProfile;
  activeProfile: PerformanceProfile;
}

export function Header({ offlineOnly, currentHardware, activeProfile }: HeaderProps) {
  return (
    <header className="bg-barbg border-b border-zinc-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0" id="app-header">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-black font-extrabold text-[10px]">AI</div>
          <h1 className="text-base font-bold font-display tracking-tight text-zinc-50 flex items-center gap-1.5">
            AI HUB <span className="text-emerald-500">CORE</span> <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded font-mono uppercase">OpenSource v1.0.4</span>
          </h1>
        </div>
        <p className="text-[11px] text-zinc-500">
          Esecuzione e installazione intelligente di modelli AI locali su hardware di fascia bassa e media.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono" id="header-stats">
        <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
          <Server className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-zinc-500">Rete:</span>
          <span className={offlineOnly ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
            {offlineOnly ? "100% OFFLINE" : "IBRIDA SYNC"}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-zinc-500">Hardware:</span>
          <span className="text-sky-300 font-bold truncate max-w-[150px]">
            {currentHardware.name}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-appbg px-3 py-1.5 rounded border border-zinc-800">
          <Settings className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-zinc-500">Profilo:</span>
          <span className="text-violet-400 font-bold uppercase">{activeProfile.name}</span>
        </div>
      </div>
    </header>
  );
}
