export type EventCallback = (data?: any) => void;

export interface IEventManager {
    subscribe(event: string, callback: EventCallback): void;
    publish(event: string, data?: any): void;
    unsubscribe(event: string, callback: EventCallback): void;
}

export class EventManager implements IEventManager {
    private static instance: EventManager;
    private listeners: Map<string, Set<EventCallback>> = new Map();

    private constructor() {}

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    public subscribe(event: string, callback: EventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    public unsubscribe(event: string, callback: EventCallback): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.delete(callback);
        }
    }

    public publish(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            for (const callback of eventListeners) {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`[EventManager] Error executing callback for event ${event}:`, e);
                }
            }
        }
    }

    public clear(): void {
        this.listeners.clear();
    }
}
