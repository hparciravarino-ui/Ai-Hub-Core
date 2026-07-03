/**
 * Dependency Injection Container
 * Manages service instances.
 */

export class DIContainer {
    private static instance: DIContainer;
    private services: Map<string, any> = new Map();

    private constructor() {}

    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    public register<T>(key: string, instance: T): void {
        if (this.services.has(key)) {
            throw new Error(`Service ${key} is already registered.`);
        }
        this.services.set(key, instance);
    }

    public resolve<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service ${key} not found in container.`);
        }
        return service as T;
    }
}
