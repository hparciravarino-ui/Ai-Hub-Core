export class CompatibilityEngine {
  public static evaluate(model: any, hardware: any) {
    if (model.type === "api") {
      return {
        status: "Perfect",
        score: 100,
        color: "text-emerald-400 bg-emerald-950 border-emerald-800",
        text: "Pienamente Compatibile (Cloud API)",
        ramRequired: 0,
        vramRequired: 0
      };
    }

    const sysRam = hardware.ram.total / (1024 * 1024 * 1024);
    // Rough estimate of free RAM / VRAM based on load if we have it, else use total
    const availRam = hardware.ram.free ? (hardware.ram.free / (1024 * 1024 * 1024)) : sysRam;
    
    let vram = 0;
    if (hardware.gpu && hardware.gpu.controllers && hardware.gpu.controllers.length > 0) {
       vram = hardware.gpu.controllers[0].vram ? hardware.gpu.controllers[0].vram / 1024 : 0;
    }

    const modelRamReq = model.sizeEstimate * 1.2; // Adding 20% overhead
    const modelVramReq = model.sizeEstimate; // If fully offloaded

    if (sysRam < modelRamReq) {
      return {
        status: "Incompatible",
        score: 0,
        color: "text-red-400 bg-red-950 border-red-800",
        text: `Incompatibile: richiede ${modelRamReq.toFixed(1)}GB RAM, disponibili ${sysRam.toFixed(1)}GB`,
        ramRequired: modelRamReq,
        vramRequired: modelVramReq
      };
    }

    if (availRam < modelRamReq) {
        return {
            status: "Warning",
            score: 50,
            color: "text-amber-400 bg-amber-950 border-amber-800",
            text: `Rischio Swap: RAM Libera (${availRam.toFixed(1)}GB) < Richiesta (${modelRamReq.toFixed(1)}GB)`,
            ramRequired: modelRamReq,
            vramRequired: modelVramReq
        };
    }

    if (vram > 0 && vram >= modelVramReq) {
        return {
            status: "Perfect",
            score: 100,
            color: "text-emerald-400 bg-emerald-950 border-emerald-800",
            text: `Pienamente Compatibile (Full GPU Offload)`,
            ramRequired: modelRamReq,
            vramRequired: modelVramReq
        };
    }

    if (vram > 0 && vram < modelVramReq) {
        return {
            status: "Good",
            score: 80,
            color: "text-emerald-400 bg-emerald-950 border-emerald-800",
            text: `Compatibile (Partial GPU Offload)`,
            ramRequired: modelRamReq,
            vramRequired: modelVramReq
        };
    }

    return {
        status: "Good",
        score: 70,
        color: "text-emerald-400 bg-emerald-950 border-emerald-800",
        text: `Compatibile (CPU + RAM Only)`,
        ramRequired: modelRamReq,
        vramRequired: modelVramReq
    };
  }
}
