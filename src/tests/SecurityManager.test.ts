import { SecurityManager } from '../core/security/SecurityManager';

// Mock test suite
console.log("Running SecurityManager tests...");
const hasPerm = SecurityManager.checkPermission('admin.read');
console.assert(hasPerm === true, "Permission check failed");
