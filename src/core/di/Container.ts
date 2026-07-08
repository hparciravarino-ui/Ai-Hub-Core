export class Container {
  private static services = new Map<string, any>();

  static register<T>(token: string, instance: T): void {
    if (this.services.has(token)) {
      console.warn(`[DI] Service '${token}' is already registered and will be overwritten.`);
    }
    this.services.set(token, instance);
  }

  static resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`[DI] Service '${token}' not found in the container.`);
    }
    return service as T;
  }

  static has(token: string): boolean {
    return this.services.has(token);
  }

  static clear(): void {
    this.services.clear();
  }
}
