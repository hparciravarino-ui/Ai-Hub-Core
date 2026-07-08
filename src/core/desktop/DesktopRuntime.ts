import { IDesktopAdapter } from './IDesktopAdapter';
import { WebFallbackAdapter } from './WebFallbackAdapter';

export class DesktopRuntime {
  private static adapter: IDesktopAdapter = new WebFallbackAdapter();

  public static setAdapter(adapter: IDesktopAdapter) {
    this.adapter = adapter;
  }

  public static getAdapter(): IDesktopAdapter {
    return this.adapter;
  }
}
