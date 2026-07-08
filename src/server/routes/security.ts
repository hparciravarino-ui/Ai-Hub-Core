import { Router } from "express";
import { EnterpriseSecurity } from "../../core/security/EnterpriseSecurity";
import { SecurityManager } from "../../core/security/SecurityManager";
import { AuditLogger } from "../../core/security/AuditLogger";

export const securityRouter = Router();

securityRouter.get("/status", (req, res) => {
  try {
    res.json({
      policies: EnterpriseSecurity.getPolicies(),
      certificates: EnterpriseSecurity.getCertificates(),
      activeRole: SecurityManager.getCurrentRoleName(),
      auditLogs: AuditLogger.getLogs().slice(-50).reverse()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

securityRouter.post("/policy", (req, res) => {
  try {
    const { policy } = req.body || {};
    if (policy) {
      EnterpriseSecurity.updatePolicies(policy);
    }
    res.json({ success: true, policies: EnterpriseSecurity.getPolicies() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

securityRouter.post("/switch-role", (req, res) => {
  try {
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ error: "Missing role" });
    SecurityManager.switchRole(role);
    res.json({ success: true, activeRole: SecurityManager.getCurrentRoleName() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

securityRouter.post("/scan-prompt", (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    const scanResult = EnterpriseSecurity.scanForPromptInjection(prompt);
    res.json(scanResult);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

securityRouter.post("/scan-code", (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Missing code" });
    const scanResult = EnterpriseSecurity.scanForCodeInjection(code);
    res.json(scanResult);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

securityRouter.post("/certificates/revoke", (req, res) => {
  try {
    const { id } = req.body || {};
    const success = EnterpriseSecurity.revokeCertificate(id);
    res.json({ success, certificates: EnterpriseSecurity.getCertificates() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
