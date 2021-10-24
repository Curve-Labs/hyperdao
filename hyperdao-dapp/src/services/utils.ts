import { autoinject } from "aurelia-framework";
import { getAddress } from "ethers/lib/utils";

@autoinject
export class Utils {

  public static sleep(milliseconds: number): Promise<any> {
    return new Promise((resolve: (args: any[]) => void): any => setTimeout(resolve, milliseconds));
  }

  public static smallHexString(str: string): string {
    if (!str) {
      return "";
    }
    const len = str.length;
    return `${str.slice(0, 6)}...${str.slice(len - 4, len)}`;
  }

  /**
   * Converts a hash into a string representation of a hex number
   * @param str
   * @returns
   */
  public static asciiToHex(str = ""): string {
    const res = [];
    const { length: len } = str;
    for (let n = 0, l = len; n < l; n++) {
      const hex = Number(str.charCodeAt(n)).toString(16);
      res.push(hex);
    }
    return `0x${res.join("")}`;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // public static getObjectKeys(obj: any): Array<string> {
  //   const temp = [];
  //   for (const prop in obj) {
  //     if (obj.hasOwnProperty(prop)) {
  //       temp.push(prop);
  //     }
  //   }
  //   return temp;
  // }

  /**
   * run a timer after a count of milliseconds greater than the 32-bit max that chrome can handle
   * @param date
   * @param func
   */
  // public static runTimerAtDate(date: Date, func: () => void): void {
  //   const now = (new Date()).getTime();
  //   const then = date.getTime();
  //   const diff = Math.max((then - now), 0);
  //   if (diff > 0x7FFFFFFF) { // setTimeout limit is MAX_INT32=(2^31-1)
  //     setTimeout(() => { Utils.runTimerAtDate(date, func); }, 0x7FFFFFFF);
  //   } else {
  //     setTimeout(func, diff);
  //   }
  // }

  public static goto(where: string): void {
    window.open(where, "_blank", "noopener noreferrer");
  }

  public static toBoolean(value?: string | boolean): boolean {
    if (!value) {
      return false;
    }

    if (typeof(value) === "string") {
      switch (value.toLocaleLowerCase()) {
        case "true":
        case "1":
        case "on":
        case "yes":
          return true;
        default:
          return false;
      }
    } else {
      return value;
    }
  }

  public static waitUntilTrue(test: () => Promise<boolean> | boolean, timeOut = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timerId = setInterval(async () => {
        if (await test()) { return resolve(); }
      }, 100);
      setTimeout(() => { clearTimeout(timerId); return reject(new Error("Test timed out..")); }, timeOut);
    });
  }

  // eslint-disable-next-line no-useless-escape
  private static pattern = new RegExp(/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?%#[\]@!\$&'\(\)\*\+,;=.]+$/i);

  public static isValidUrl(str: string, emptyOk = false): boolean {
    return (emptyOk && (!str || !str.trim())) || (str && Utils.pattern.test(str));
  }

  public static isValidEmail(email: string, emptyOk = false): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (emptyOk && (!email || !email.trim())) || (email && re.test(String(email).toLowerCase()));
  }

  public static isAddress(address: string, emptyOk = false): boolean {
    try {
      return (emptyOk && (!address || !address.trim())) || (address && !!getAddress(address));
    } catch (e) { return false; }
  }

  /**
   * Convert string of individual UTF-8 bytes into a regular UTF-8 string
   * @param str1 individual UTF-8 bytes as a string
   * @returns
   */
  public static toAscii(str1: string): string {
    const hex = str1.toString();
    let str = "";
    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }
}
