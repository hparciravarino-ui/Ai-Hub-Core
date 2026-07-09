import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, BrainCircuit, Cpu, Wand2, MessageSquare, Folder, Brain, Users, GitMerge, ListOrdered, Blocks, ShieldCheck, Server, BookOpen, Search, Star, ChevronLeft, ChevronRight, Menu, Command, Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  downloadedModelsCount: number;
}

export function Sidebar({ activeTab, setActiveTab, downloadedModelsCount }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['chat', 'dashboard', 'assistant']);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const getTabClass = (tabId: string, colorClass: string) => {
    return `w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 space-x-3'} py-2 rounded-md text-xs font-medium transition-all group relative ${
      activeTab === tabId
        ? `bg-zinc-800/80 ${colorClass === 'text-white' ? 'text-zinc-100' : colorClass} border-l-2 ${colorClass.replace('text-', 'border-')} font-bold`
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-l-2 border-transparent"
    }`;
  };

  const navItems = [
    { id: 'chat', label: 'Sistema Chat Pro', icon: MessageSquare, category: 'Chatbot', color: 'text-emerald-400', badge: 'NEW', shortcut: '⌘1' },
    { id: 'assistant', label: 'Playground & Tools', icon: Cpu, category: 'Chatbot', color: 'text-violet-400', shortcut: '⌘2' },
    { id: 'dashboard', label: 'Pannello Controllo', icon: LayoutDashboard, category: 'Sistema', color: 'text-emerald-500', shortcut: '⌘3' },
    { id: 'providers', label: 'Provider AI', icon: Server, category: 'Sistema', color: 'text-indigo-400', badge: 'API', shortcut: '⌘P' },
    { id: 'system', label: 'Sistema & Telemetria', icon: Server, category: 'Sistema', color: 'text-zinc-400', shortcut: '⌘4' },
    { id: 'installation', label: 'Installazione & Setup', icon: Cpu, category: 'Sistema', color: 'text-cyan-400', badge: 'WIZARD', shortcut: '⌘5' },
    { id: 'models', label: 'Gestione Modelli', icon: Database, category: 'AI Models', color: 'text-sky-400', badge: downloadedModelsCount > 0 ? downloadedModelsCount : null, shortcut: '⌘M' },
    { id: 'optimizer', label: 'Intelligence Engine', icon: BrainCircuit, category: 'AI Models', color: 'text-blue-400', shortcut: '⌘I' },
    { id: 'evolution', label: 'Motore Evolutivo', icon: Brain, category: 'AI Models', color: 'text-emerald-400', badge: 'AEE', shortcut: '⌘E' },
    { id: 'benchmark', label: 'Benchmark Models', icon: ListOrdered, category: 'AI Models', color: 'text-orange-400', shortcut: '⌘B' },
    { id: 'rag', label: 'Piattaforma RAG', icon: Database, category: 'Strumenti', color: 'text-blue-500', badge: 'VEC', shortcut: '⌘R' },
    { id: 'agents', label: 'Team Multi-Agenti', icon: Users, category: 'Strumenti', color: 'text-purple-400', badge: 'RUN', shortcut: '⌘A' },
    { id: 'workflows', label: 'Workflow Automazione', icon: GitMerge, category: 'Strumenti', color: 'text-emerald-500', badge: 'DAG', shortcut: '⌘W' },
    { id: 'scheduler', label: 'Scheduler Coda', icon: ListOrdered, category: 'Strumenti', color: 'text-zinc-400', shortcut: '⌘S' },
    { id: 'plugins', label: 'Plugin Estensioni', icon: Blocks, category: 'Strumenti', color: 'text-zinc-400', shortcut: '⌘P' },
    { id: 'security', label: 'Sicurezza & Privacy', icon: ShieldCheck, category: 'Strumenti', color: 'text-zinc-400', shortcut: '⌘K' },
    { id: 'filemanager', label: 'File & Storage IO', icon: Folder, category: 'Strumenti', color: 'text-emerald-500', shortcut: '⌘F' },
    { id: 'analyzer', label: 'Analisi Progetto', icon: Folder, category: 'Strumenti', color: 'text-emerald-400', badge: 'AI', shortcut: '⌘J' },
    { id: 'media', label: 'Media Lab', icon: Wand2, category: 'Strumenti', color: 'text-amber-400', shortcut: '⌘L' },
    { id: 'guide', label: 'Guida all\'Uso', icon: BookOpen, category: 'Strumenti', color: 'text-violet-400', shortcut: '⌘H' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        navItems.forEach(item => {
          if (item.shortcut) {
            const key = item.shortcut.replace('⌘', '').toLowerCase();
            if (e.key.toLowerCase() === key) {
              e.preventDefault();
              setActiveTab(item.id);
            }
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  const categories = Array.from(new Set(navItems.map(item => item.category)));

  const filteredItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 transition-all duration-300 relative z-20`} id="sidebar-navigation">
      
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 text-zinc-100">
            <Menu className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight">AI Hub Enterprise</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3 border-b border-zinc-800/50">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-2.5 top-1.5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Cerca comandi (⌘F)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1.5 pl-8 pr-2 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 custom-scrollbar">
        
        {/* Favorites Category */}
        {!searchQuery && favorites.length > 0 && (
          <div className="space-y-0.5">
            {!isCollapsed && (
              <div className="text-[10px] font-mono font-bold text-amber-500/70 uppercase tracking-widest pl-3 py-1.5 select-none flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Star className="w-3 h-3" /> Preferiti</span>
              </div>
            )}
            {isCollapsed && <div className="h-px bg-zinc-800 my-2 mx-2" />}
            
            <nav className="space-y-0.5">
              {navItems.filter(item => favorites.includes(item.id)).map(item => (
                <button 
                  key={`fav-${item.id}`} 
                  onClick={() => setActiveTab(item.id)} 
                  className={getTabClass(item.id, item.color)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <Star 
                        onClick={(e) => toggleFavorite(e, item.id)}
                        className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all ml-2 shrink-0 fill-amber-500" 
                      />
                    </>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {categories.map(category => {
          const catItems = filteredItems.filter(item => item.category === category);
          if (catItems.length === 0) return null;

          return (
            <div key={category} className="space-y-0.5">
              {!isCollapsed && (
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-3 py-1.5 select-none flex items-center justify-between">
                  <span>{category}</span>
                </div>
              )}
              {isCollapsed && <div className="h-px bg-zinc-800 my-2 mx-2" />}
              
              <nav className="space-y-0.5">
                {catItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={getTabClass(item.id, item.color)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`bg-zinc-800/80 ${item.color} text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm border border-zinc-700/50`}>
                            {item.badge}
                          </span>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-500 font-mono transition-opacity ml-1.5 shrink-0">
                          {item.shortcut}
                        </span>
                        <Star 
                          onClick={(e) => toggleFavorite(e, item.id)}
                          className={`w-3 h-3 ml-1.5 shrink-0 transition-all ${favorites.includes(item.id) ? 'text-amber-500 fill-amber-500 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'}`} 
                        />
                      </>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Footer Settings / System Info */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-950">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center space-x-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="font-mono truncate">Connected</span>
            </div>
            <Settings className="w-4 h-4 hover:text-zinc-100 cursor-pointer transition-colors" onClick={() => setActiveTab("installation")} />
          </div>
        ) : (
          <div className="flex justify-center">
            <Settings className="w-5 h-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" onClick={() => setActiveTab("installation")} />
          </div>
        )}
      </div>
    </aside>
  );
}

