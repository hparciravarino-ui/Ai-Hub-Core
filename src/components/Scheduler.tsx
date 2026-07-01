import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  Plus,
  Play,
  Pause,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { TaskItem } from "../types";

export default function Scheduler() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "task_1",
      name: "Inference: Llama 3.2 Chat Completion",
      priority: "High",
      status: "running",
      progress: 65,
      type: "Inference",
      timestamp: "10:14:22",
      latency: 42,
      tokenPerSec: 28,
    },
    {
      id: "task_2",
      name: "Index: RAG PDF Embedded Chunking",
      priority: "Normal",
      status: "paused",
      progress: 30,
      type: "Task",
      timestamp: "10:13:05",
      latency: 180,
    },
    {
      id: "task_3",
      name: "Batch: Traduzione Sequenziale Documento 'report.txt'",
      priority: "Low",
      status: "queued",
      progress: 0,
      type: "Batch",
      timestamp: "10:15:00",
      latency: 0,
    }
  ]);

  // Simulate progress bar on active tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.status === "running") {
            const nextProgress = t.progress + Math.floor(Math.random() * 8) + 2;
            if (nextProgress >= 100) {
              return {
                ...t,
                progress: 100,
                status: "completed",
                latency: Math.round(t.latency * 0.9),
              };
            }
            return { ...t, progress: nextProgress };
          }
          return t;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === "running" ? "paused" : t.status === "paused" ? "running" : t.status;
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = () => {
    const newTask: TaskItem = {
      id: "task_" + Math.random().toString(36).substr(2, 5),
      name: "Batch: OCR estrazione capitoli PDF",
      priority: "Normal",
      status: "queued",
      progress: 0,
      type: "Batch",
      timestamp: new Date().toLocaleTimeString(),
      latency: 0,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleStartQueue = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status === "queued" || t.status === "paused") {
          return { ...t, status: "running" };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6" id="scheduler-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-barbg p-4 border border-zinc-800 rounded-xl" id="scheduler-actions-bar">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-emerald-400" />
            Scheduler Processi & Coda Inferenza
          </h3>
          <p className="text-xs text-zinc-500">Pianifica carichi batch paralleli e imposta la priorità dell'hardware logico.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddTask}
            className="flex items-center space-x-1.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuovo Processo</span>
          </button>
          <button
            onClick={handleStartQueue}
            className="flex items-center space-x-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-bold transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Avvia Tutti</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Queue List (2 cols) */}
        <div className="lg:col-span-2 space-y-4" id="scheduler-queue-list">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-panelbg border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                      task.type === "Inference"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                        : task.type === "Batch"
                        ? "bg-violet-950/40 text-violet-400 border-violet-900"
                        : "bg-amber-950/40 text-amber-400 border-amber-900"
                    }`}>
                      {task.type}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">ID: {task.id}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200 mt-1.5">{task.name}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    task.priority === "High"
                      ? "bg-red-950/40 text-red-400 border border-red-900/60"
                      : task.priority === "Normal"
                      ? "bg-zinc-800/40 text-zinc-400 border border-zinc-700/60"
                      : "bg-blue-950/40 text-blue-400 border border-blue-900/60"
                  }`}>
                    {task.priority}
                  </span>

                  {task.status !== "completed" && (
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className="p-1 bg-appbg hover:bg-zinc-800/40 border border-zinc-850 rounded text-zinc-400 transition"
                    >
                      {task.status === "running" ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress and status metrics */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    Stato:{" "}
                    <strong className={`capitalize ${
                      task.status === "running"
                        ? "text-emerald-400 animate-pulse"
                        : task.status === "paused"
                        ? "text-amber-500"
                        : task.status === "completed"
                        ? "text-sky-400"
                        : "text-zinc-500"
                    }`}>
                      {task.status}
                    </strong>
                  </span>
                  <span className="font-mono text-[11px]">{task.progress}%</span>
                </div>
                <div className="w-full bg-barbg h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      task.status === "completed"
                        ? "bg-sky-500"
                        : task.status === "paused"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* Inference technical numbers */}
              {(task.status === "running" || task.status === "completed") && (
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-850 pt-2 flex-wrap gap-2">
                  <span>Ora avvio: {task.timestamp}</span>
                  {task.latency > 0 && <span>Latenza: <strong className="text-zinc-300">{task.latency}ms</strong></span>}
                  {task.tokenPerSec && <span>Velocità: <strong className="text-emerald-400">{task.tokenPerSec} tok/s</strong></span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Queue Multi-threading Analytics (1 col) */}
        <div className="p-5 bg-panelbg border border-zinc-800 rounded-xl flex flex-col justify-between" id="scheduler-analytics">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Prestazioni Schedulatore
            </h3>
            <p className="text-xs text-zinc-500">
              Il sistema bilancia dinamicamente le risorse locali per garantire la reattività dell'interfaccia principale.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-barbg border border-zinc-800 rounded-lg space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 block">MULTITHREAD POOL</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Stato Threadpool</span>
                  <span className="text-emerald-400 font-mono font-bold">Ottimizzato (12/12 Core)</span>
                </div>
              </div>

              <div className="p-3 bg-barbg border border-zinc-800 rounded-lg space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 block">PARALLEL SESSIONS CONTROL</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Limite Sessioni Simultanee</span>
                  <span className="text-zinc-300 font-mono font-bold">2 Modelli (RAM Safe)</span>
                </div>
              </div>

              <div className="p-3 bg-barbg border border-zinc-800 rounded-lg space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 block">CONCURRENCY CONTEXT LOCK</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Lock del Contesto KV</span>
                  <span className="text-emerald-400 font-mono">Libero (Nessuna collisione)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-barbg/40 border border-zinc-800 text-xs text-zinc-500 rounded-lg flex gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                I processi di tipo <strong>Inference</strong> (Chat, OCR, traduzione) hanno priorità immediata sui thread della CPU, mentre le elaborazioni batch vengono messe in pausa automaticamente.
              </span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 mt-4 leading-normal text-center border-t border-zinc-850 pt-3">
            Scheduler Engine v1.0.0 • Esecuzione asincrona guidata da runtime locali.
          </div>
        </div>
      </div>
    </div>
  );
}
