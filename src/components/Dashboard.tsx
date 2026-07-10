import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {
  Cpu, Flame, Gauge, Layers, Zap, CheckCircle, AlertTriangle, RefreshCw, TrendingUp, Server, Globe, Activity,
  Brain, Database, Folder, MessageSquare, HardDrive, ListOrdered, ShieldCheck, Blocks, GripHorizontal
} from "lucide-react";
import { HardwareProfile, PerformanceProfileId } from "../types";
import { PERFORMANCE_PROFILES } from "../data";
import { Card, CardContent } from "./ui/Card";
import { SectionHeader } from "./ui/SectionHeader";
import { HardwareService } from "../core/services/HardwareService";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutDashboard } from "lucide-react";

interface DashboardProps {
  currentHardware: HardwareProfile;
  selectedProfileId: PerformanceProfileId;
  onProfileChange: (profileId: PerformanceProfileId) => void;
  installedModelsCount: number;
  setActiveTab?: (tab: string) => void;
}

const SortableWidget = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full flex flex-col">
      <Card className={`h-full flex flex-col bg-zinc-950/80 border-zinc-800/80 backdrop-blur-sm shadow-xl transition-all ${isDragging ? 'shadow-2xl border-emerald-500/50 scale-[1.02]' : 'hover:border-zinc-700/80'}`}>
        <CardContent className="p-4 flex-grow flex flex-col relative group">
          <div className="flex items-center justify-between text-zinc-400 mb-4 border-b border-zinc-800/50 pb-2">
            <div className="flex items-center space-x-2">
              <Icon className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-300">{title}</span>
            </div>
            <button {...attributes} {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-zinc-800 p-1.5 rounded transition-all active:cursor-grabbing" title="Trascina per riordinare">
              <GripHorizontal className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
          <div className="flex-grow flex flex-col justify-center">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Dashboard({
  currentHardware,
  selectedProfileId,
  onProfileChange,
  installedModelsCount,
  setActiveTab,
}: DashboardProps) {
  const [metrics, setMetrics] = useState({ cpu: 0, gpu: 0, ram: 0, vram: 0, temp: 0, tokensPerSec: 0, latency: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState({ ping: null as number | null, isOnline: false });

  const [widgetOrder, setWidgetOrder] = useState([
    'hardware', 'performance', 'telemetry', 'provider', 'rag', 'workspace', 'chat', 'storage', 'benchmark', 'security', 'plugin', 'knowledge'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    let mounted = true;
    const fetchMetrics = async () => {
      try {
        const live = await HardwareService.getLiveMetrics();
        if(!mounted) return;
        setMetrics(prev => ({
          cpu: Math.min(100, Math.max(0, Math.round(live.cpu))),
          gpu: 0,
          ram: Math.min(100, Math.max(0, Math.round(live.ram))),
          vram: Math.round(live.vram),
          temp: Math.round(live.temp),
          tokensPerSec: 0,
          latency: 0,
        }));
      } catch (err) {}
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const selectedProfile = PERFORMANCE_PROFILES.find((p) => p.id === selectedProfileId) || PERFORMANCE_PROFILES[1];

  const widgetsData: Record<string, { title: string, icon: any, render: () => React.ReactNode, colSpan?: string }> = {
    hardware: {
      title: "Hardware Resources", icon: Cpu,
      render: () => (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-xs font-mono">CPU Load</span>
              <span className="text-emerald-400 font-mono text-sm">{metrics.cpu}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${metrics.cpu}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-xs font-mono">RAM Load</span>
              <span className="text-violet-400 font-mono text-sm">{metrics.ram}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${metrics.ram}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
             <span className="text-[10px] text-zinc-500 font-mono">TEMP: {metrics.temp}°C</span>
             <Flame className={`w-3 h-3 ${metrics.temp > 75 ? 'text-rose-500 animate-pulse' : 'text-zinc-600'}`} />
          </div>
        </div>
      )
    },
    performance: {
      title: "Performance Profile", icon: Zap,
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-xl font-bold text-zinc-100 capitalize">{selectedProfile.name}</div>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{selectedProfile.description}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 flex flex-col items-center justify-center">
              <span className="block text-zinc-500 mb-0.5 text-[10px] uppercase">Threads</span>
              <span className="font-mono text-zinc-200">{Math.max(1, Math.round(currentHardware.threads * selectedProfile.cpuThreadsMultiplier))}</span>
            </div>
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 flex flex-col items-center justify-center">
              <span className="block text-zinc-500 mb-0.5 text-[10px] uppercase">Context</span>
              <span className="font-mono text-zinc-200">{selectedProfile.contextWindow}</span>
            </div>
          </div>
        </div>
      )
    },
    telemetry: {
      title: "Telemetry Status", icon: Activity,
      render: () => (
        <div className="h-full flex flex-col items-center justify-center space-y-3">
          <div className="relative">
             <Activity className="w-10 h-10 text-emerald-500" />
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <div className="text-center">
             <div className="text-sm font-semibold text-zinc-200">System Online</div>
             <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Capturing 42 metrics/sec</div>
          </div>
        </div>
      )
    },
    provider: {
      title: "AI Providers", icon: Globe,
      render: () => (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/50 rounded-md border border-zinc-800/50">
            <span className="text-xs font-semibold text-zinc-300">Gemini API</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/50 rounded-md border border-zinc-800/50">
            <span className="text-xs font-semibold text-zinc-300">OpenRouter</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900/50 rounded-md border border-zinc-800/50">
            <span className="text-xs font-semibold text-zinc-300">Local Llama</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>
      )
    },
    knowledge: {
      title: "Knowledge Base", icon: Brain,
      render: () => (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="text-4xl font-light font-mono text-cyan-400 tracking-tighter">1,024</div>
          <div className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">Documenti Indicizzati</div>
        </div>
      )
    },
    rag: {
      title: "RAG Engine", icon: Database,
      render: () => (
        <div className="space-y-2 text-xs h-full flex flex-col justify-center">
          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Vector DB</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 rounded-sm border border-emerald-900/50 font-mono">ONLINE</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Embeddings</span>
            <span className="text-zinc-300 font-mono text-[10px]">nomic-embed</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-zinc-500">Dimensione</span>
            <span className="text-zinc-300 font-mono text-[10px]">768d</span>
          </div>
        </div>
      )
    },
    workspace: {
      title: "Workspace", icon: Folder, colSpan: "md:col-span-2",
      render: () => (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex gap-3">
            <div className="flex-1 bg-zinc-900/40 border border-zinc-800/50 rounded p-3 flex flex-col justify-between">
              <Folder className="w-5 h-5 text-blue-400 mb-2" />
              <div>
                <div className="text-xs font-bold text-zinc-200">React Dashboard</div>
                <div className="text-[10px] text-zinc-500 mt-1">/src/components</div>
              </div>
            </div>
            <div className="flex-1 bg-zinc-900/40 border border-zinc-800/50 rounded p-3 flex flex-col justify-between">
               <Database className="w-5 h-5 text-purple-400 mb-2" />
               <div>
                <div className="text-xs font-bold text-zinc-200">API Gateway</div>
                <div className="text-[10px] text-zinc-500 mt-1">/backend/routes</div>
               </div>
            </div>
          </div>
        </div>
      )
    },
    chat: {
      title: "Professional Chat", icon: MessageSquare,
      render: () => (
        <div className="flex flex-col h-full justify-center">
          <button 
            onClick={() => setActiveTab?.("chat")}
            className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold rounded-md transition-colors shadow flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Avvia Sessione</span>
          </button>
        </div>
      )
    },
    storage: {
      title: "Local Storage", icon: HardDrive,
      render: () => (
        <div className="space-y-4 flex flex-col justify-center h-full">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-xs font-mono">Sandbox I/O</span>
              <span className="text-sky-400 font-mono text-sm">24.5 GB</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-sky-500 transition-all" style={{ width: `45%` }} />
            </div>
            <div className="text-[10px] text-zinc-500 mt-1.5 text-right font-mono">45% Occupato</div>
          </div>
        </div>
      )
    },
    benchmark: {
      title: "Benchmark", icon: ListOrdered,
      render: () => (
        <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 h-full">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Score Globale</div>
            <div className="font-mono text-2xl font-light text-zinc-100">8,492</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center">
            <span className="text-emerald-500 text-[10px] font-bold">98%</span>
          </div>
        </div>
      )
    },
    security: {
      title: "Security Shield", icon: ShieldCheck,
      render: () => (
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <div className="p-3 bg-emerald-500/10 rounded-full">
             <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-200">Sistema Protetto</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">0 minacce rilevate</div>
          </div>
        </div>
      )
    },
    plugin: {
      title: "Plugins", icon: Blocks,
      render: () => (
        <div className="flex flex-col h-full justify-center space-y-3 px-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-2"><Blocks className="w-3.5 h-3.5 text-zinc-500" /> Installati</span>
            <span className="font-mono text-zinc-200 bg-zinc-800 px-1.5 rounded">4</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Attivi</span>
            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 rounded">3</span>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      <SectionHeader 
        title="Enterprise Dashboard" 
        description="Gestione modulare dell'ecosistema. Trascina i widget per personalizzare il tuo layout."
        icon={<LayoutDashboard className="w-5 h-5 text-emerald-500" />}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-[160px]">
            {widgetOrder.map(id => {
              const widget = widgetsData[id];
              if (!widget) return null;
              return (
                <div key={id} className={widget.colSpan || "col-span-1"}>
                  <SortableWidget id={id} title={widget.title} icon={widget.icon}>
                    {widget.render()}
                  </SortableWidget>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
