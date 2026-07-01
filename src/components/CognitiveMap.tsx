import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Settings,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  Activity,
  Info,
  GitBranch,
  FileCode,
  Sliders,
  Sparkles
} from "lucide-react";

// Graph Types
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "user" | "project" | "file" | "api" | "database" | "library" | "preference" | "custom";
  details?: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
}

interface CognitiveMapProps {
  memories: {
    id: string;
    category: string;
    title: string;
    content: string;
  }[];
  onNodeSelect?: (node: GraphNode | null) => void;
}

export default function CognitiveMap({ memories, onNodeSelect }: CognitiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Default graph entities
  const [staticNodes, setStaticNodes] = useState<GraphNode[]>([
    { id: "node_user", label: "hp.arci.ravarino (Utente)", type: "user", details: "Sviluppatore primario ed amministratore dell'ecosistema" },
    { id: "node_proj", label: "AI Hub Community (Progetto)", type: "project", details: "Piattaforma centrale per la cooperazione locale" },
    { id: "node_app", label: "App.tsx", type: "file", details: "Entrypoint dell'interfaccia React SPA" },
    { id: "node_srv", label: "server.ts", type: "file", details: "Backend Express server con proxy API" },
    { id: "node_gemini", label: "Gemini 3.5 Flash", type: "library", details: "Modello LLM utilizzato per inferenza locale ed asincrona" },
    { id: "node_db", label: "SQLite (SQLCipher)", type: "database", details: "Database crittografato locale per persistenza cache" },
  ]);

  const [staticLinks, setStaticLinks] = useState<GraphLink[]>([
    { source: "node_user", target: "node_proj", relation: "Sviluppa" },
    { source: "node_proj", target: "node_app", relation: "Renderizza UI" },
    { source: "node_proj", target: "node_srv", relation: "Inizializza" },
    { source: "node_srv", target: "node_db", relation: "Salva cache" },
    { source: "node_proj", target: "node_gemini", relation: "Inferisce tramite" },
  ]);

  // Combined nodes and links (static + dynamic from memories + custom added)
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  // Selection state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Custom interactive node adding form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<GraphNode["type"]>("file");
  const [newDetails, setNewDetails] = useState("");
  const [connectTo, setConnectTo] = useState("node_proj");
  const [relationText, setRelationText] = useState("Collega a");

  // Physics Force configuration states
  const [linkDistance, setLinkDistance] = useState(100);
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [collisionRadius, setCollisionRadius] = useState(30);
  const [centerForce, setCenterForce] = useState(0.4);

  // SVG Dimension state
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Update dynamic graph from memories & custom nodes
  useEffect(() => {
    // Collect all nodes
    const memoryNodes: GraphNode[] = memories.map(mem => ({
      id: `mem_${mem.id}`,
      label: mem.title,
      type: "preference",
      details: mem.content
    }));

    const allNodes = [...staticNodes, ...memoryNodes];

    // Collect all links
    const memoryLinks: GraphLink[] = memories.map(mem => ({
      source: "node_proj",
      target: `mem_${mem.id}`,
      relation: `Ricorda (${mem.category})`
    }));

    const allLinks = [...staticLinks, ...memoryLinks];

    setNodes(allNodes);
    setLinks(allLinks);
  }, [memories, staticNodes, staticLinks]);

  // Handle ResizeObserver to make map fluid and responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 300),
        height: Math.max(height, 350),
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main D3 force layout rendering cycle
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear previous cycles safely

    const width = dimensions.width;
    const height = dimensions.height;

    // Clone arrays to prevent state mutation errors in D3
    const d3Nodes: GraphNode[] = nodes.map(n => ({ ...n }));
    const d3Links: GraphLink[] = links.map(l => {
      // Resolve IDs to match correctly in simulation
      const sourceId = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
      const targetId = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
      return {
        source: sourceId,
        target: targetId,
        relation: l.relation
      };
    });

    // Outer container grouping for zoom/pan
    const gContainer = svgElement.append("g").attr("class", "graph-contents");

    // Implement Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        gContainer.attr("transform", event.transform);
      });

    svgElement.call(zoomBehavior);

    // Glow effects / filters definitions
    const defs = svgElement.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");

    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Marker arrows for relationships
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22) // Set distance offset to look good on nodes
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#3f3f46");

    // Initialize Simulation forces
    const simulation = d3.forceSimulation<GraphNode>(d3Nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(d3Links)
        .id(d => d.id)
        .distance(linkDistance)
      )
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("collide", d3.forceCollide().radius(collisionRadius))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(centerForce));

    // Links/lines drawing
    const linkElements = gContainer.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(d3Links)
      .enter()
      .append("line")
      .attr("stroke", "#27272a")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", d => d.relation.includes("Ricorda") ? "4,4" : "0")
      .attr("marker-end", "url(#arrowhead)");

    // Relation labels on hover
    const edgeLabels = gContainer.append("g")
      .attr("class", "edge-labels")
      .selectAll("text")
      .data(d3Links)
      .enter()
      .append("text")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-size", "7px")
      .attr("fill", "#71717a")
      .attr("text-anchor", "middle")
      .text(d => d.relation);

    // Nodes groups drawing
    const nodeGroups = gContainer.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(d3Nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // Find original state node to preserve full reactive updates
        const originalNode = nodes.find(n => n.id === d.id) || d;
        setSelectedNode(originalNode);
        if (onNodeSelect) onNodeSelect(originalNode);
        event.stopPropagation();
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Draw background shape for node
    nodeGroups.append("rect")
      .attr("width", 110)
      .attr("height", 32)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("x", -55)
      .attr("y", -16)
      .attr("fill", d => {
        switch (d.type) {
          case "user": return "#082f49"; // sky-950
          case "project": return "#1e1b4b"; // indigo-950
          case "file": return "#064e3b"; // emerald-950
          case "database": return "#422006"; // amber-950
          case "library": return "#4c0519"; // rose-950
          case "preference": return "#311042"; // fuchsia-950/purple-950
          default: return "#18181b"; // zinc-900
        }
      })
      .attr("stroke", d => {
        if (selectedNode && selectedNode.id === d.id) return "#10b981"; // emerald-500
        switch (d.type) {
          case "user": return "#0ea5e9"; // sky-500
          case "project": return "#6366f1"; // indigo-500
          case "file": return "#10b981"; // emerald-500
          case "database": return "#f59e0b"; // amber-500
          case "library": return "#f43f5e"; // rose-500
          case "preference": return "#c084fc"; // purple-400
          default: return "#52525b"; // zinc-600
        }
      })
      .attr("stroke-width", d => (selectedNode && selectedNode.id === d.id) ? 2 : 1)
      .style("filter", d => (selectedNode && selectedNode.id === d.id) ? "url(#glow)" : "none");

    // Text labels
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -1)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", "bold")
      .attr("font-size", "8px")
      .attr("fill", "#f4f4f5")
      .text(d => truncate(d.label, 18));

    // Type labels
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 11)
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-size", "6.5px")
      .attr("fill", d => {
        switch (d.type) {
          case "user": return "#38bdf8";
          case "project": return "#818cf8";
          case "file": return "#34d399";
          case "database": return "#fbbf24";
          case "library": return "#fb7185";
          case "preference": return "#e879f9";
          default: return "#a1a1aa";
        }
      })
      .text(d => d.type.toUpperCase());

    // Update coordinates on tick
    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      edgeLabels
        .attr("x", d => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return (s.x! + t.x!) / 2;
        })
        .attr("y", d => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return (s.y! + t.y!) / 2 - 4;
        });

      nodeGroups.attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    // Helper functions for dragging
    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Helper for title truncation
    function truncate(str: string, len: number) {
      if (str.length <= len) return str;
      return str.substring(0, len - 3) + "...";
    }

    // Zoom shortcuts
    d3.select("#zoom-in").on("click", () => {
      svgElement.transition().duration(250).call(zoomBehavior.scaleBy, 1.3);
    });

    d3.select("#zoom-out").on("click", () => {
      svgElement.transition().duration(250).call(zoomBehavior.scaleBy, 0.7);
    });

    d3.select("#zoom-reset").on("click", () => {
      svgElement.transition().duration(250).call(zoomBehavior.transform, d3.zoomIdentity);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, linkDistance, chargeStrength, collisionRadius, centerForce, selectedNode]);

  // Handle adding a custom node
  const handleAddCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const customId = `custom_${Date.now()}`;
    const newNode: GraphNode = {
      id: customId,
      label: newLabel,
      type: newType,
      details: newDetails || "Nodo personalizzato aggiunto dall'utente."
    };

    const newLink: GraphLink = {
      source: connectTo,
      target: customId,
      relation: relationText || "Collegato"
    };

    setStaticNodes(prev => [...prev, newNode]);
    setStaticLinks(prev => [...prev, newLink]);

    // Reset Form
    setNewLabel("");
    setNewDetails("");
    setRelationText("Collega a");
    setShowAddForm(false);
  };

  // Handle deleting a node (only custom/static ones we can remove)
  const handleDeleteNode = (id: string) => {
    if (id.startsWith("node_")) {
      alert("I nodi core di sistema non possono essere eliminati.");
      return;
    }
    setStaticNodes(prev => prev.filter(n => n.id !== id));
    setStaticLinks(prev => prev.filter(l => l.source !== id && l.target !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
      if (onNodeSelect) onNodeSelect(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5" id="cognitive-map-root">
      
      {/* LEFT COLUMN: INTERACTIVE VISUAL CANVAS */}
      <div className="xl:col-span-8 flex flex-col bg-[#090909] border border-zinc-850 rounded-xl overflow-hidden relative min-h-[400px]">
        
        {/* Canvas Header */}
        <div className="p-3 bg-zinc-950/80 border-b border-zinc-850/60 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-300">Grafo delle Relazioni D3.js (Physics Space)</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              id="zoom-in"
              title="Zoom Avanti"
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="zoom-out"
              title="Zoom Indietro"
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="zoom-reset"
              title="Ripristina Vista"
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1"></div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded transition ${
                showAddForm ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>Aggiungi Nodo</span>
            </button>
          </div>
        </div>

        {/* The D3 SVG Workspace */}
        <div ref={containerRef} className="flex-1 w-full h-full relative min-h-[300px]">
          <div className="absolute top-2 left-2 bg-zinc-950/90 border border-zinc-850 p-2 rounded text-[9px] font-mono text-zinc-500 pointer-events-none z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Utente (User)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Progetto (Project)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> File di Codice (File)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Preferenze / Regole (AEE Memory)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Database / Risorse
            </div>
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minHeight: "350px" }}
          ></svg>
        </div>

        {/* Physics Tuning Panel */}
        <div className="p-3 bg-zinc-950/85 border-t border-zinc-850/60 z-10 text-[10px] font-mono text-zinc-400">
          <details className="cursor-pointer">
            <summary className="flex items-center space-x-1.5 hover:text-zinc-200 select-none">
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Parametri Fisici & Forze (D3 Force-Directed Simulation)</span>
            </summary>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 pb-1">
              <div className="space-y-1">
                <span className="text-zinc-500">Distanza Link: {linkDistance}px</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={linkDistance}
                  onChange={(e) => setLinkDistance(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500">Repulsione Charge: {chargeStrength}</span>
                <input
                  type="range"
                  min="-600"
                  max="-100"
                  value={chargeStrength}
                  onChange={(e) => setChargeStrength(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500">Collision Radius: {collisionRadius}px</span>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={collisionRadius}
                  onChange={(e) => setCollisionRadius(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500">Centering Gravity: {centerForce}</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={centerForce}
                  onChange={(e) => setCenterForce(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* RIGHT COLUMN: INSPECTOR & INTERACTION FORMS */}
      <div className="xl:col-span-4 space-y-4">
        
        {/* Form to add a Node */}
        {showAddForm && (
          <div className="bg-panelbg border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Aggiungi Nodo Semantico</span>
              <button onClick={() => setShowAddForm(false)} className="text-[10px] text-zinc-500 hover:text-zinc-300">Chiudi</button>
            </div>

            <form onSubmit={handleAddCustomNode} className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono block mb-1">Nome/Etichetta Nodo</span>
                <input
                  type="text"
                  required
                  placeholder="Es: auth.middleware.ts"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none placeholder-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Tipo Entità</span>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-appbg border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none"
                  >
                    <option value="file">File Codice</option>
                    <option value="api">API Endpoint</option>
                    <option value="database">Database</option>
                    <option value="library">Libreria / SDK</option>
                    <option value="custom">Altro / Custom</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Collega a</span>
                  <select
                    value={connectTo}
                    onChange={(e) => setConnectTo(e.target.value)}
                    className="w-full bg-appbg border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block mb-1">Relazione logica</span>
                <input
                  type="text"
                  placeholder="Es: Implementa, Collega a, Dipende da"
                  value={relationText}
                  onChange={(e) => setRelationText(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none placeholder-zinc-600"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block mb-1">Dettagli / Descrizione</span>
                <textarea
                  rows={2}
                  placeholder="Scrivi una breve descrizione..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full bg-appbg border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none placeholder-zinc-600 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-800/60 py-1.5 rounded font-mono font-semibold transition"
              >
                Inietta nel Grafo Cognitivo
              </button>
            </form>
          </div>
        )}

        {/* Node Inspector Panel */}
        <div className="bg-panelbg border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="border-b border-zinc-850 pb-2">
            <h4 className="text-xs font-bold text-zinc-100 font-mono uppercase tracking-wider flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dettagli Nodo Grafo</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Ispezione semantica dell'entità selezionata.</p>
          </div>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                    selectedNode.type === "user" ? "bg-sky-950/40 text-sky-400 border-sky-900/60" :
                    selectedNode.type === "project" ? "bg-indigo-950/40 text-indigo-400 border-indigo-900/60" :
                    selectedNode.type === "file" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60" :
                    selectedNode.type === "database" ? "bg-amber-950/40 text-amber-400 border-amber-900/60" :
                    selectedNode.type === "library" ? "bg-rose-950/40 text-rose-400 border-rose-900/60" :
                    "bg-purple-950/40 text-purple-400 border-purple-900/60"
                  }`}>
                    {selectedNode.type}
                  </span>
                  
                  {!selectedNode.id.startsWith("node_") && (
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="text-zinc-600 hover:text-red-400 transition cursor-pointer"
                      title="Elimina questo nodo custom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-zinc-100 font-bold font-mono text-sm">{selectedNode.label}</div>
                
                {selectedNode.details && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans bg-zinc-900/50 p-2 rounded border border-zinc-850">
                    {selectedNode.details}
                  </p>
                )}
              </div>

              {/* Connected edges details */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Relazioni Dirette:</span>
                <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                  {(() => {
                    const connections = links.filter(l => {
                      const srcId = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
                      const tgtId = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
                      return srcId === selectedNode.id || tgtId === selectedNode.id;
                    });

                    if (connections.length === 0) {
                      return <div className="text-[10px] text-zinc-600 italic">Nessuna connessione logica diretta.</div>;
                    }

                    return connections.map((c, idx) => {
                      const srcId = typeof c.source === "object" ? (c.source as GraphNode).id : c.source;
                      const tgtId = typeof c.target === "object" ? (c.target as GraphNode).id : c.target;
                      const isSource = srcId === selectedNode.id;
                      const otherNodeId = isSource ? tgtId : srcId;
                      const otherNode = nodes.find(n => n.id === otherNodeId);

                      return (
                        <div key={idx} className="p-1.5 bg-zinc-950/60 border border-zinc-850/60 rounded flex items-center justify-between font-mono text-[10px]">
                          <span className="text-zinc-400">
                            {isSource ? "Destinazione: " : "Origine: "}
                            <strong className="text-zinc-200">{otherNode ? otherNode.label : otherNodeId}</strong>
                          </span>
                          <span className="text-emerald-400 text-[9px] font-bold bg-emerald-950/20 border border-emerald-900/60 px-1 rounded">
                            {c.relation}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-950/30 border border-dashed border-zinc-850 text-center rounded-lg text-[11px] text-zinc-500 italic">
              Clicca su un nodo del grafo per visualizzare i dettagli semantici, le relazioni d'impatto e le preferenze connesse.
            </div>
          )}
        </div>

        {/* Live System Diagnostics */}
        <div className="bg-panelbg border border-zinc-800 rounded-xl p-4 space-y-2">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Level 3 Diagnostics</span>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Nodi Attivi:</span>
            <span className="text-zinc-200 font-bold">{nodes.length} elementi</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Relazioni Semantiche:</span>
            <span className="text-zinc-200 font-bold">{links.length} archi</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Stato Fisica:</span>
            <span className="text-emerald-400 font-bold">Stabile (In Equilibrato)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
