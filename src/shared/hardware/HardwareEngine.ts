import { Collector } from './Collector';
import { Normalizer } from './Normalizer';
import { Validator } from './Validator';

export class HardwareEngine {
  public static async scan() {
    const rawData = await Collector.collectRawData();
    const normalizedData = Normalizer.normalizeHardwareData(rawData);
    const validProfile = Validator.validate(normalizedData);
    return validProfile;
  }
}
