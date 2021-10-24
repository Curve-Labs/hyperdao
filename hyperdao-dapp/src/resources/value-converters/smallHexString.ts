import { Utils } from "services/utils";

export class SmallHexStringValueConverter {
  public toView(value: string): string {
    return Utils.smallHexString(value);
  }
}
