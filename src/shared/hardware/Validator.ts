export class Validator {
  public static validate(profile: any) {
    if (!profile) throw new Error("Hardware profile missing");
    if (!profile.cpu || !profile.ram || !profile.os) {
      throw new Error("Hardware profile is incomplete");
    }
    return profile;
  }
}
