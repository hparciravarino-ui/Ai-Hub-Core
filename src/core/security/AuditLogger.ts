import { eventBus } from '../events/EventBus';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: any;
}

export class AuditLogger {
  private static logs: AuditEvent[] = [];

  public static log(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const fullEvent: AuditEvent = {
      ...event,
      id: `audit_\${Date.now()}_\${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    };
    this.logs.push(fullEvent);
    eventBus.publish('audit_event_logged', fullEvent);
  }

  public static getLogs(): AuditEvent[] {
    return this.logs;
  }
}
