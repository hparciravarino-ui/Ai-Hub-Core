import { AuditLogger } from './AuditLogger';
import { EnterpriseSecurity } from './EnterpriseSecurity';

export interface UserRole {
  name: string;
  permissions: string[];
}

export class SecurityManager {
  private static currentUserRole: UserRole = { name: 'admin', permissions: ['*'] };

  public static checkPermission(permission: string, actor: string = 'system'): boolean {
    const hasPerm = EnterpriseSecurity.checkPermission(this.currentUserRole.name, permission);
    AuditLogger.log({ 
      actor, 
      action: 'CHECK_PERMISSION', 
      resource: permission, 
      status: hasPerm ? 'SUCCESS' : 'FAILURE' 
    });
    return hasPerm;
  }

  public static sanitizeInput(input: string): string {
    if (!input) return '';
    // Prevent script tag injection
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[REDACTED]");
    // Clean up dangerous HTML event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, "");
    return sanitized;
  }

  public static getCurrentRoleName(): string {
    return this.currentUserRole.name;
  }

  public static switchRole(roleName: 'admin' | 'auditor' | 'developer' | 'user') {
    const perms = roleName === 'admin' ? ['*'] : roleName === 'auditor' ? ['security.audit_read', 'telemetry.view'] : [];
    this.currentUserRole = { name: roleName, permissions: perms };
    
    AuditLogger.log({
      actor: 'admin',
      action: 'SWITCH_ACTIVE_ROLE',
      resource: `role:${roleName}`,
      status: 'SUCCESS'
    });
  }
}

