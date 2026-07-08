export class Normalizer {
  public static normalizeHardwareData(rawData: any) {
    const { hardware, runtimes } = rawData;
    const { cpu, graphics, mem, os, diskLayout, fsSize, load, temp } = hardware;

    let aiHardware: string[] = [];
    if (cpu.manufacturer.includes('Apple') && (cpu.brand.includes('M1') || cpu.brand.includes('M2') || cpu.brand.includes('M3') || cpu.brand.includes('M4'))) {
        aiHardware.push('Apple Neural Engine');
    }
    if (cpu.model.includes('Ultra') || cpu.model.toLowerCase().includes('npu')) {
        aiHardware.push('Intel NPU');
    }
    if (cpu.brand.toLowerCase().includes('ryzen') && cpu.brand.toLowerCase().includes('ai')) {
        aiHardware.push('AMD Ryzen AI');
    }
    if (cpu.brand.toLowerCase().includes('snapdragon')) {
        aiHardware.push('Qualcomm Hexagon');
    }

    let aiDrivers: string[] = [];
    const gpuVendors = graphics.controllers.map((g: any) => (g.vendor || '').toLowerCase());
    if (gpuVendors.some((v: string) => v.includes('nvidia'))) aiDrivers.push('CUDA');
    if (gpuVendors.some((v: string) => v.includes('amd') || v.includes('advanced micro devices'))) aiDrivers.push('ROCm');
    if (os.platform === 'darwin') aiDrivers.push('Metal');
    aiDrivers.push('Vulkan', 'OpenCL'); // Commonly available if there is a GPU

    let storageSpeed = 'Standard';
    let hasNVMe = diskLayout.some((d: any) => d.interfaceType === 'NVMe');
    let hasSSD = diskLayout.some((d: any) => d.type === 'SSD');
    if (hasNVMe) storageSpeed = 'NVMe (High Speed)';
    else if (hasSSD) storageSpeed = 'SSD (Fast)';
    else storageSpeed = 'HDD (Slow)';

    const totalStorage = fsSize.reduce((acc: number, curr: any) => acc + curr.size, 0);
    const freeStorage = fsSize.reduce((acc: number, curr: any) => acc + curr.available, 0);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        model: cpu.brand,
        architecture: os.arch,
        physicalCores: cpu.physicalCores,
        threads: cpu.cores,
        cache: {
          l1d: cpu.cache.l1d,
          l1i: cpu.cache.l1i,
          l2: cpu.cache.l2,
          l3: cpu.cache.l3
        },
        frequency: cpu.speed + ' GHz',
        flags: cpu.flags,
        virtualization: cpu.virtualization
      },
      gpu: {
        controllers: graphics.controllers.map((g: any) => ({
          vendor: g.vendor,
          model: g.model,
          vram: g.vram,
          driverVersion: g.driverVersion || 'N/A'
        })),
        displays: graphics.displays
      },
      ram: {
        total: mem.total,
        free: mem.free,
        used: mem.active,
        speed: mem.clockSpeed || 'Unknown'
      },
      storage: {
        disks: diskLayout.map((d: any) => ({
          type: d.type,
          interface: d.interfaceType,
          name: d.name,
          size: d.size
        })),
        speed: storageSpeed,
        totalBytes: totalStorage,
        freeBytes: freeStorage
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        build: os.build,
        kernel: os.kernel,
        arch: os.arch
      },
      aiHardware: aiHardware,
      aiDrivers: aiDrivers,
      runtimes: runtimes,
      raw: { currentLoad: load, temp: temp }
    };
  }
}
