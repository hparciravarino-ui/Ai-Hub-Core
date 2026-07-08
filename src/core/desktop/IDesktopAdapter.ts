export interface IDesktopAdapter {
  isDesktop(): boolean;
  showNotification(title: string, body: string): Promise<void>;
  readClipboard(): Promise<string>;
  writeClipboard(text: string): Promise<void>;
  getSystemInfo(): Promise<any>;
  openExternal(url: string): Promise<void>;
  saveFile(content: string, suggestedName: string): Promise<boolean>;
}
