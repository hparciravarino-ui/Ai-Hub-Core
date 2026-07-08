import { IDesktopAdapter } from './IDesktopAdapter';

export class WebFallbackAdapter implements IDesktopAdapter {
  public isDesktop(): boolean { return false; }
  
  public async showNotification(title: string, body: string): Promise<void> {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    } else {
      console.log(`[Notification] \${title}: \${body}`);
    }
  }

  public async readClipboard(): Promise<string> {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    }
    return "";
  }

  public async writeClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  }

  public async getSystemInfo(): Promise<any> {
    return {
      os: navigator.platform,
      userAgent: navigator.userAgent,
      memory: (navigator as any).deviceMemory || 'unknown'
    };
  }

  public async openExternal(url: string): Promise<void> {
    window.open(url, '_blank');
  }

  public async saveFile(content: string, suggestedName: string): Promise<boolean> {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedName;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  }
}
