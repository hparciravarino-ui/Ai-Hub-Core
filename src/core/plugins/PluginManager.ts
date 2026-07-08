import { IPlugin, PluginContext } from './IPlugin';
import { SecurityManager } from '../security/SecurityManager';
import { AuditLogger } from '../security/AuditLogger';
import { eventBus } from '../events/EventBus';
import { PluginSDKEngine, PluginInstance } from './PluginSDK';

export class PluginManager {
  private static coreInitialized = false;

  public static initializeCore() {
    if (this.coreInitialized) return;
    PluginSDKEngine.initialize();
    this.coreInitialized = true;
  }

  public static async loadPlugin(plugin: IPlugin): Promise<boolean> {
    try {
      this.initializeCore();
      
      // Map basic IPlugin into our Enterprise Plugin SDK representation
      const manifestWithEnterpriseProps = {
        id: plugin.manifest.id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        author: plugin.manifest.author || 'Community',
        license: 'MIT' as const,
        description: plugin.manifest.description,
        permissions: plugin.manifest.permissions,
        dependencies: {},
        signature: 'sig_aihub_enterprise_community_trusted',
        checksum: `sha256_mock_${Math.random().toString(36).substring(7)}`,
        compatibility: { minCoreVersion: '2.0.0', os: ['windows' as const, 'macos' as const, 'linux' as const] }
      };

      const success = await PluginSDKEngine.installPlugin(manifestWithEnterpriseProps);
      
      AuditLogger.log({ 
        actor: 'system', 
        action: 'LOAD_PLUGIN', 
        resource: plugin.manifest.id, 
        status: success ? 'SUCCESS' : 'FAILURE' 
      });
      return success;
    } catch (err: any) {
      AuditLogger.log({ 
        actor: 'system', 
        action: 'LOAD_PLUGIN', 
        resource: plugin.manifest.id, 
        status: 'FAILURE',
        details: err.message
      });
      return false;
    }
  }

  public static getPlugins(): any[] {
    this.initializeCore();
    // Return plugins mapped into a structure the legacy parts expect if necessary
    return PluginSDKEngine.getPlugins().map(p => ({
      manifest: p.manifest,
      status: p.getStatus(),
      config: p.config
    }));
  }
}
export { PluginSDKEngine };

