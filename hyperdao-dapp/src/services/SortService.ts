import { BigNumber } from "ethers";

export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

export class SortService {

  public static toggleSortOrder(order: SortOrder): SortOrder {
    return order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
  }

  public static evaluateString(a: string, b: string, sortOrder: SortOrder = SortOrder.ASC): number {
    if (!a && !b) { return 0; }

    if (!a) { return -sortOrder; }
    if (!b) { return sortOrder; }

    a = a.toLowerCase();
    b = b.toLowerCase();

    return a.localeCompare(b) * sortOrder;
  }

  public static evaluateBigNumber(a: BigNumber, b: BigNumber, sortOrder: SortOrder = SortOrder.ASC): number {
    const isDefinedA = SortService.isDefined(a);
    const isDefinedB = SortService.isDefined(b);

    if (!isDefinedA && !isDefinedB) { return 0; }

    if (!isDefinedA) { return -sortOrder; }
    if (!isDefinedB) { return sortOrder; }

    const diff = a.sub(b);

    return ((diff.gt(0) ? 1 : (diff.lt(0) ? -1 : 0))) * sortOrder;
  }

  public static evaluateBoolean(a: boolean, b: boolean, sortOrder: SortOrder = SortOrder.ASC): number {
    return SortService.evaluateNumber(
      a ? 1 : ((a === undefined) ? undefined : 0),
      b ? 1 : ((b === undefined) ? undefined : 0), sortOrder);
  }

  public static evaluateNumber(a: number, b: number, sortOrder: SortOrder = SortOrder.ASC): number {
    const isDefinedA = SortService.isDefined(a);
    const isDefinedB = SortService.isDefined(b);

    if (!isDefinedA && !isDefinedB) { return 0; }

    if (!isDefinedA) { return -sortOrder; }
    if (!isDefinedB) { return sortOrder; }

    return (a - b) * sortOrder;
  }

  public static evaluateDateTime(valueA: string, valueB: string, sortOrder: SortOrder = SortOrder.ASC): number {
    return SortService.evaluateDateTimeAsDate(new Date(valueA), new Date(valueB), sortOrder);
  }

  public static evaluateDateTimeAsDate(valueA: Date, valueB: Date, sortOrder: SortOrder = SortOrder.ASC): number {
    const a = valueA?.valueOf();
    const b = valueB?.valueOf();

    if (!a && !b) { return 0; }

    if (!a) { return -sortOrder; }
    if (!b) { return sortOrder; }

    return (a - b) * sortOrder;
  }

  private static isDefined(v: any): boolean {
    return typeof v !== "undefined";
  }
}
