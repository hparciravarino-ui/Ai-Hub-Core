export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: string[];
}

export interface IPlugin {
  manifest: PluginManifest;
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
}

export interface PluginContext {
  registerHook(event: string, callback: Function): void;
  requestPermission(permission: string): boolean;
  // Other safe APIs provided to plugins
}
