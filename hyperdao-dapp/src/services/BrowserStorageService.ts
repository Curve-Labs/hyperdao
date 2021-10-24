import pkg from "../../package.json";

/**
 * local and session storage with package- and version-specific keys
 * and support for default values.
 */
export class BrowserStorageService {
  private addVersion(value: any, version: string) {
    return {
      data: value,
      _version: version,
    };
  }

  private getKey(key: string) {
    return `${pkg.name}.${key}`;
  }

  private set(storage: any, key: string, value: unknown, version?: string): any {
    const data = version !== null ? this.addVersion(value, version) : value;
    return storage.setItem(this.getKey(key), JSON.stringify(data));
  }

  private get<T = any>(
    storage: any,
    key: string,
    defaultValue: any = null,
    version?: string,
  ): T {
    const rawValue = storage.getItem(this.getKey(key));

    if (rawValue !== null) {
      try {
        const value = JSON.parse(rawValue);

        if (version !== null) {
          return value._version === version ? value.data : defaultValue;
        }
        return value;
      } catch (e) {
        return defaultValue;
      }
    }

    return defaultValue;
  }

  private remove(storage: any, key: string): void {
    return storage.removeItem(this.getKey(key));
  }

  public lsSet(key: string, value: unknown, version?: string): any {
    return this.set(localStorage, key, value, version);
  }

  public lsGet<T = any>(
    key: string,
    defaultValue: any = null,
    version?: string,
  ): T {
    return this.get(localStorage, key, defaultValue, version);
  }

  public lsRemove(key: string): void {
    return this.remove(localStorage, key);
  }

  public ssSet(key: string, value: unknown, version?: string): any {
    return this.set(sessionStorage, key, value, version);
  }

  public ssGet<T = any>(
    key: string,
    defaultValue: any = null,
    version?: string,
  ): T {
    return this.get(sessionStorage, key, defaultValue, version);
  }

  public ssRemove(key: string): void {
    return this.remove(sessionStorage, key);
  }
}
