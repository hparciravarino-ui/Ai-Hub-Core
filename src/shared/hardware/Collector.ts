import { Scanner } from './Scanner';

export class Collector {
  public static async collectRawData() {
    const hardware = await Scanner.scanSystem();
    const runtimes = await Scanner.scanRuntimes();

    return {
      hardware,
      runtimes
    };
  }
}
