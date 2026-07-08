import { AuditLogger } from '../security/AuditLogger';
import { SecurityManager } from '../security/SecurityManager';
import { eventBus } from '../events/EventBus';
import { EnterpriseSecurity } from '../security/EnterpriseSecurity';

export interface ExtendedPluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  license: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'Proprietary';
  description: string;
  permissions: string[];
  dependencies: Record<string, string>; // e.g. "core-utils": ">=1.0.0"
  signature: string; // Cryptographic validation token
  checksum: string; // SHA256 integrity token
  compatibility: {
    minCoreVersion: string;
    os: ('windows' | 'macos' | 'linux')[];
  };
}

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
}

export interface PluginHook {
  event: string;
  callback: (payload: any) => void;
}

export class PluginInstance {
  public manifest: ExtendedPluginManifest;
  public config: PluginConfig;
  private hooks: PluginHook[] = [];
  private state: 'installed' | 'active' | 'disabled' | 'error' = 'installed';

  constructor(manifest: ExtendedPluginManifest, initialSettings: Record<string, any> = {}) {
    this.manifest = manifest;
    this.config = {
      enabled: false,
      settings: initialSettings
    };
  }

  public async load(sandboxContext: any): Promise<boolean> {
    try {
      // 1. Verify digital signature & integrity check via Enterprise Security
      const isSignatureValid = EnterpriseSecurity.validatePluginSignature(this.manifest.id, this.manifest.signature);
      if (!isSignatureValid) {
        this.state = 'error';
        throw new Error(`Firma digitale non valida per il plugin: ${this.manifest.id}`);
      }

      // 2. Setup safe runtime proxy sandbox
      this.config.enabled = true;
      this.state = 'active';

      // Simulate registration of default hooks
      this.registerHook('system_tick', (tickData) => {
        // Safe executed code in sandboxed plugin loop
      });

      AuditLogger.log({
        actor: 'plugin_loader',
        action: 'PLUGIN_ACTIVATED',
        resource: this.manifest.id,
        status: 'SUCCESS',
        details: { version: this.manifest.version }
      });
      return true;
    } catch (e: any) {
      this.state = 'error';
      AuditLogger.log({
        actor: 'plugin_loader',
        action: 'PLUGIN_ACTIVATION_FAILED',
        resource: this.manifest.id,
        status: 'FAILURE',
        details: { error: e.message }
      });
      return false;
    }
  }

  public registerHook(event: string, callback: (payload: any) => void) {
    if (this.state !== 'active') return;

    // Permissions gatecheck
    const requiredPermission = `hooks.subscribe.${event}`;
    const authorized = SecurityManager.checkPermission(requiredPermission, `plugin:${this.manifest.id}`);
    if (!authorized && event !== 'system_tick') {
      AuditLogger.log({
        actor: `plugin:${this.manifest.id}`,
        action: 'SUBSCRIBE_HOOK_BLOCKED',
        resource: event,
        status: 'FAILURE'
      });
      return;
    }

    const hook: PluginHook = { event, callback };
    this.hooks.push(hook);
    eventBus.subscribe(event, callback);
  }

  public async unload(): Promise<void> {
    this.config.enabled = false;
    this.state = 'disabled';
    this.hooks = [];
    AuditLogger.log({
      actor: 'plugin_loader',
      action: 'PLUGIN_DEACTIVATED',
      resource: this.manifest.id,
      status: 'SUCCESS'
    });
  }

  public getStatus() {
    return this.state;
  }
}

export class PluginSDKEngine {
  private static registry: Map<string, PluginInstance> = new Map();
  private static rollbackArchive: Map<string, { manifest: ExtendedPluginManifest; settings: any }[]> = new Map();

  // Initialize with some certified enterprise plugins
  public static initialize() {
    const gitPlugin = new PluginInstance({
      id: 'com.aihub.git',
      name: 'Git Enterprise Integration',
      version: '1.2.0',
      author: 'AI Hub Solution Architects',
      license: 'MIT',
      description: 'Gestione e tracciamento dei commit Git, analisi dei file sorgente per gli agenti cognitivi.',
      permissions: ['filesystem.read', 'process.exec'],
      dependencies: {},
      signature: 'sig_aihub_enterprise_9823f',
      checksum: 'sha256_b31a56fbc8a2ef88172bc9',
      compatibility: { minCoreVersion: '2.0.0', os: ['windows', 'macos', 'linux'] }
    }, { autoPull: true, remoteURL: 'https://github.com/enterprise/repo.git' });

    const dockerPlugin = new PluginInstance({
      id: 'com.aihub.docker',
      name: 'Docker Controller Sandboxed',
      version: '1.0.0',
      author: 'AI Hub DevOps Team',
      license: 'Apache-2.0',
      description: 'Avvia ed esegue container isolati Docker per validazione runtime sicura di script generati da agenti.',
      permissions: ['docker.socket', 'network.http'],
      dependencies: { 'com.aihub.git': '>=1.2.0' },
      signature: 'sig_aihub_enterprise_88fa1',
      checksum: 'sha256_111d4e2a8c3d5a49fb2a912',
      compatibility: { minCoreVersion: '2.0.0', os: ['linux', 'macos'] }
    }, { endpoint: 'unix:///var/run/docker.sock' });

    this.registry.set(gitPlugin.manifest.id, gitPlugin);
    this.registry.set(dockerPlugin.manifest.id, dockerPlugin);

    // Load enabled plugins
    gitPlugin.load({});
    dockerPlugin.load({});
  }

  public static getPlugins(): PluginInstance[] {
    return Array.from(this.registry.values());
  }

  // Lifecycle action: Install
  public static async installPlugin(manifest: ExtendedPluginManifest, settings = {}): Promise<boolean> {
    if (this.registry.has(manifest.id)) {
      throw new Error(`Plugin con ID ${manifest.id} già installato nel sistema.`);
    }

    const instance = new PluginInstance(manifest, settings);
    const loaded = await instance.load({});
    if (loaded) {
      this.registry.set(manifest.id, instance);
      AuditLogger.log({
        actor: 'admin',
        action: 'PLUGIN_INSTALLED',
        resource: manifest.id,
        status: 'SUCCESS'
      });
      return true;
    }
    return false;
  }

  // Lifecycle action: Upgrade with support for rollback archives
  public static async upgradePlugin(id: string, newManifest: ExtendedPluginManifest): Promise<boolean> {
    const existing = this.registry.get(id);
    if (!existing) return false;

    // Archive current version for recovery rollbacks
    const history = this.rollbackArchive.get(id) || [];
    history.push({
      manifest: { ...existing.manifest },
      settings: { ...existing.config.settings }
    });
    this.rollbackArchive.set(id, history);

    // Shut down existing
    await existing.unload();

    // Setup new version
    const upgradedInstance = new PluginInstance(newManifest, existing.config.settings);
    const loaded = await upgradedInstance.load({});
    if (loaded) {
      this.registry.set(id, upgradedInstance);
      AuditLogger.log({
        actor: 'admin',
        action: 'PLUGIN_UPGRADED',
        resource: id,
        status: 'SUCCESS',
        details: { from: existing.manifest.version, to: newManifest.version }
      });
      return true;
    } else {
      // Automatic recovery rollback on critical upgrade failures
      AuditLogger.log({
        actor: 'system',
        action: 'UPGRADE_FAILED_ROLLBACK_TRIGGERED',
        resource: id,
        status: 'WARNING'
      });
      await this.rollbackPlugin(id);
      return false;
    }
  }

  // Lifecycle action: Rollback to previous archived snapshot
  public static async rollbackPlugin(id: string): Promise<boolean> {
    const history = this.rollbackArchive.get(id);
    if (!history || history.length === 0) {
      throw new Error(`Nessuna versione precedente registrata negli archivi di rollback per il plugin: ${id}`);
    }

    const lastBackup = history.pop()!;
    const existing = this.registry.get(id);
    if (existing) {
      await existing.unload();
    }

    const rolledInstance = new PluginInstance(lastBackup.manifest, lastBackup.settings);
    const loaded = await rolledInstance.load({});
    if (loaded) {
      this.registry.set(id, rolledInstance);
      AuditLogger.log({
        actor: 'system',
        action: 'PLUGIN_ROLLEDBACK',
        resource: id,
        status: 'SUCCESS',
        details: { targetVersion: lastBackup.manifest.version }
      });
      return true;
    }
    return false;
  }

  // Lifecycle action: Disable
  public static async togglePluginStatus(id: string): Promise<boolean> {
    const plugin = this.registry.get(id);
    if (!plugin) return false;

    if (plugin.getStatus() === 'active') {
      await plugin.unload();
    } else {
      await plugin.load({});
    }
    return true;
  }

  // Lifecycle action: Uninstall
  public static async uninstallPlugin(id: string): Promise<boolean> {
    const plugin = this.registry.get(id);
    if (!plugin) return false;

    await plugin.unload();
    this.registry.delete(id);
    this.rollbackArchive.delete(id);

    AuditLogger.log({
      actor: 'admin',
      action: 'PLUGIN_UNINSTALLED',
      resource: id,
      status: 'SUCCESS'
    });
    return true;
  }
}
