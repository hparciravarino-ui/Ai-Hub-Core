import { Router } from "express";
import { EnterpriseDesktopBridge } from "../../core/desktop/EnterpriseDesktopBridge";

export const desktopRouter = Router();

desktopRouter.get("/status", (req, res) => {
  try {
    res.json({
      platform: EnterpriseDesktopBridge.getPlatform(),
      services: EnterpriseDesktopBridge.getBackgroundServices(),
      notifications: EnterpriseDesktopBridge.getNotifications(),
      shortcuts: EnterpriseDesktopBridge.getShortcuts(),
      update: EnterpriseDesktopBridge.getUpdateStatus()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

desktopRouter.post("/switch-os", (req, res) => {
  try {
    const { os } = req.body || {};
    if (!os) return res.status(400).json({ error: "Missing os parameter" });
    EnterpriseDesktopBridge.setPlatform(os);
    res.json({ success: true, platform: EnterpriseDesktopBridge.getPlatform() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

desktopRouter.post("/toggle-service", (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing service name" });
    const success = EnterpriseDesktopBridge.toggleBackgroundService(name);
    res.json({ success, services: EnterpriseDesktopBridge.getBackgroundServices() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

desktopRouter.post("/register-shortcut", (req, res) => {
  try {
    const { hotkey, action } = req.body || {};
    if (!hotkey || !action) return res.status(400).json({ error: "Missing hotkey or action" });
    const success = EnterpriseDesktopBridge.registerShortcut(hotkey, action);
    res.json({ success, shortcuts: EnterpriseDesktopBridge.getShortcuts() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

desktopRouter.post("/check-updates", async (req, res) => {
  try {
    const status = await EnterpriseDesktopBridge.checkForUpdates();
    res.json({ success: true, status });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

desktopRouter.post("/apply-update", (req, res) => {
  try {
    const success = EnterpriseDesktopBridge.applyUpdate();
    res.json({ success, status: EnterpriseDesktopBridge.getUpdateStatus() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
