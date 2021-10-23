/**
 * convert between boolean and string
 */
export class BooleanValueConverter {

  /**
   * boolean to string
   * @param val
   */
  public fromView(val: string,
    as: { true: string, false: string, default: string } = { true: "Yes", false: "No", default: "?" })
    : boolean | undefined {

    if ((val === undefined) || (val === null) || (val === as.default)) {
      return undefined;
    }

    return (val === as.true) ? true : (val === as.false) ? false : undefined;
  }

  /**
   * string to boolean
   * @param val
   */
  public toView(val: boolean,
    as: { true: string, false: string, default: string } = { true: "Yes", false: "No", default: "?" })
    : string {

    if ((val === undefined) || (val === null)) {
      return as.default;
    }

    return val ? as.true : as.false;
  }
}
