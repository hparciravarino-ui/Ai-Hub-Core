import { Router } from "express";
import { PluginSDKEngine } from "../../core/plugins/PluginSDK";

export const pluginsRouter = Router();

pluginsRouter.get("/list", (req, res) => {
  try {
    const plugins = PluginSDKEngine.getPlugins().map(p => ({
      manifest: p.manifest,
      status: p.getStatus(),
      config: p.config
    }));
    res.json(plugins);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

pluginsRouter.post("/toggle", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing plugin id" });
    const success = await PluginSDKEngine.togglePluginStatus(id);
    res.json({ success, plugins: PluginSDKEngine.getPlugins().map(p => ({
      manifest: p.manifest,
      status: p.getStatus(),
      config: p.config
    })) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

pluginsRouter.post("/rollback", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing plugin id" });
    const success = await PluginSDKEngine.rollbackPlugin(id);
    res.json({ success });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

pluginsRouter.post("/install", async (req, res) => {
  try {
    const { manifest } = req.body || {};
    if (!manifest) return res.status(400).json({ error: "Missing plugin manifest" });
    const success = await PluginSDKEngine.installPlugin(manifest);
    res.json({ success });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
