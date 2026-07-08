import { AuditLogger } from '../security/AuditLogger';

export interface BackgroundServiceStatus {
  name: string;
  type: 'python_env' | 'node_sandbox' | 'docker_daemon' | 'llamafile_inference' | 'git_service';
  status: 'running' | 'stopped' | 'failed';
  pid?: number;
  uptimeSeconds: number;
  cpuPercentage: number;
}

export interface OSNotification {
  id: string;
  title: string;
  body: string;
  urgency: 'low' | 'normal' | 'critical';
  timestamp: string;
}

export interface AutoUpdateStatus {
  currentVersion: string;
  availableVersion: string | null;
  status: 'idle' | 'checking' | 'downloading' | 'ready_to_install' | 'error';
  downloadProgress: number;
  releaseNotes?: string;
}

export class EnterpriseDesktopBridge {
  private static platform: 'windows' | 'macos' | 'linux' = 'windows';
  private static backgroundServices: BackgroundServiceStatus[] = [];
  private static notifications: OSNotification[] = [];
  private static activeShortcuts: Map<string, string> = new Map(); // Shortcut -> Action
  private static permissions: Record<string, 'granted' | 'prompt' | 'denied'> = {
    filesystem: 'granted',
    gpu_acceleration: 'granted',
    docker_socket: 'granted',
    notifications: 'granted',
    tray_control: 'granted'
  };

  private static updateStatus: AutoUpdateStatus = {
    currentVersion: '2.0.0-enterprise',
    availableVersion: null,
    status: 'idle',
    downloadProgress: 0
  };

  public static initialize(os: 'windows' | 'macos' | 'linux' = 'windows') {
    this.platform = os;
    this.backgroundServices = [
      { name: 'Python PyTorch Runtime', type: 'python_env', status: 'running', pid: 14208, uptimeSeconds: 3600, cpuPercentage: 0.2 },
      { name: 'Docker Node Host', type: 'docker_daemon', status: 'running', pid: 9022, uptimeSeconds: 3600, cpuPercentage: 1.4 },
      { name: 'Llama.cpp Backend', type: 'llamafile_inference', status: 'stopped', uptimeSeconds: 0, cpuPercentage: 0.0 },
      { name: 'Enterprise Git Sync', type: 'git_service', status: 'running', pid: 15301, uptimeSeconds: 1800, cpuPercentage: 0.1 }
    ];

    // Default system shortcuts
    this.activeShortcuts.set('Ctrl+Alt+S', 'Ouvri Pannello Sicurezza');
    this.activeShortcuts.set('Ctrl+Alt+T', 'Attiva Telemetria');
    this.activeShortcuts.set('Ctrl+Alt+P', 'Sospendi Modelli AI');

    AuditLogger.log({
      actor: 'desktop_runtime',
      action: 'RUNTIME_INITIALIZED',
      resource: `os:${os}`,
      status: 'SUCCESS',
      details: { servicesCount: this.backgroundServices.length }
    });
  }

  // OS Detection & Adapters
  public static getPlatform(): 'windows' | 'macos' | 'linux' {
    return this.platform;
  }

  public static setPlatform(os: 'windows' | 'macos' | 'linux') {
    this.platform = os;
    AuditLogger.log({
      actor: 'admin',
      action: 'SWITCH_OS_ENV',
      resource: `env:${os}`,
      status: 'SUCCESS'
    });
  }

  // OS Permission Manager
  public static getPermissionStatus(key: string): 'granted' | 'prompt' | 'denied' {
    return this.permissions[key] || 'denied';
  }

  public static requestOSPermission(key: string): Promise<'granted' | 'denied'> {
    return new Promise((resolve) => {
      this.permissions[key] = 'granted';
      AuditLogger.log({
        actor: 'user',
        action: 'OS_PERMISSION_REQUEST',
        resource: key,
        status: 'SUCCESS'
      });
      resolve('granted');
    });
  }

  // Background Services supervisor
  public static getBackgroundServices(): BackgroundServiceStatus[] {
    return this.backgroundServices;
  }

  public static toggleBackgroundService(name: string): boolean {
    const service = this.backgroundServices.find(s => s.name === name);
    if (!service) return false;

    if (service.status === 'running') {
      service.status = 'stopped';
      service.pid = undefined;
      service.cpuPercentage = 0;
    } else {
      service.status = 'running';
      service.pid = Math.floor(Math.random() * 20000) + 10000;
      service.cpuPercentage = 0.5;
    }

    AuditLogger.log({
      actor: 'desktop_runtime',
      action: 'TOGGLE_BACKGROUND_SERVICE',
      resource: name,
      status: 'SUCCESS',
      details: { status: service.status }
    });

    return true;
  }

  // Native Tray & Notifications Engine
  public static dispatchNotification(title: string, body: string, urgency: 'low' | 'normal' | 'critical' = 'normal'): OSNotification {
    const notif: OSNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title,
      body,
      urgency,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift(notif);
    if (this.notifications.length > 20) this.notifications.pop();

    AuditLogger.log({
      actor: 'notification_engine',
      action: 'DISPATCH_OS_NOTIFICATION',
      resource: title,
      status: 'SUCCESS'
    });

    return notif;
  }

  public static getNotifications(): OSNotification[] {
    return this.notifications;
  }

  public static clearNotifications() {
    this.notifications = [];
  }

  // Global Hotkeys Shortcut registry
  public static getShortcuts(): Record<string, string> {
    const obj: Record<string, string> = {};
    this.activeShortcuts.forEach((action, key) => {
      obj[key] = action;
    });
    return obj;
  }

  public static registerShortcut(hotkey: string, actionName: string): boolean {
    if (this.activeShortcuts.has(hotkey)) return false;
    this.activeShortcuts.set(hotkey, actionName);

    AuditLogger.log({
      actor: 'shortcut_registry',
      action: 'REGISTER_HOTKEY',
      resource: hotkey,
      status: 'SUCCESS',
      details: { action: actionName }
    });
    return true;
  }

  public static unregisterShortcut(hotkey: string): boolean {
    const deleted = this.activeShortcuts.delete(hotkey);
    if (deleted) {
      AuditLogger.log({
        actor: 'shortcut_registry',
        action: 'UNREGISTER_HOTKEY',
        resource: hotkey,
        status: 'SUCCESS'
      });
    }
    return deleted;
  }

  // Auto update worker simulation
  public static getUpdateStatus(): AutoUpdateStatus {
    return this.updateStatus;
  }

  public static checkForUpdates(): Promise<AutoUpdateStatus> {
    this.updateStatus.status = 'checking';
    return new Promise((resolve) => {
      setTimeout(() => {
        this.updateStatus.status = 'downloading';
        this.updateStatus.availableVersion = '2.1.0-enterprise';
        this.updateStatus.releaseNotes = 'Aggiornamento critico di sicurezza enterprise. Aggiunte protezioni prompt injection elevate.';
        
        let progressInterval = setInterval(() => {
          if (this.updateStatus.downloadProgress >= 100) {
            clearInterval(progressInterval);
            this.updateStatus.status = 'ready_to_install';
            AuditLogger.log({
              actor: 'updater',
              action: 'UPDATE_DOWNLOAD_READY',
              resource: 'v2.1.0-enterprise',
              status: 'SUCCESS'
            });
          } else {
            this.updateStatus.downloadProgress += 20;
          }
        }, 300);
        
        resolve(this.updateStatus);
      }, 500);
    });
  }

  public static applyUpdate(): boolean {
    if (this.updateStatus.status !== 'ready_to_install') return false;

    AuditLogger.log({
      actor: 'updater',
      action: 'UPDATE_APPLIED_RESTARTING',
      resource: 'v2.1.0-enterprise',
      status: 'SUCCESS'
    });

    this.updateStatus.currentVersion = '2.1.0-enterprise';
    this.updateStatus.availableVersion = null;
    this.updateStatus.status = 'idle';
    this.updateStatus.downloadProgress = 0;
    return true;
  }
}
