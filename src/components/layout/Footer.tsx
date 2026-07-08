import React from 'react';

export function Footer() {
  return (
    <footer className="h-10 bg-barbg border-t border-zinc-800 px-6 flex items-center justify-between font-mono text-[9px] text-zinc-500" id="app-footer-metrics">
      <div className="flex gap-6">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> ENGINE ACTIVE
        </span>
        <span>CORE TEMP: 54°C</span>
        <span>DISK: 124GB FREE</span>
      </div>
      <div className="flex gap-4">
        <span className="text-zinc-600 italic">PWA Desktop v1.0.4 - MIT Licensed</span>
        <span className="text-emerald-500 font-semibold">AUTO-OPTIMIZE: ON</span>
      </div>
    </footer>
  );
}
