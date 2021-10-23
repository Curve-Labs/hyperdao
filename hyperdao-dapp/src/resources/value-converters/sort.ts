
export class SortValueConverter {
  /**
   * returns a copy of the array, sorted by sortEvaluator
   * @param array
   * @param sortEvaluator
   * @returns
   */
  toView(array: Array<any>, sortEvaluator: (a: any, b: any) => number): Array<any> {
    if (!array?.length) {
      return array;
    }
    return array.slice(0).sort(sortEvaluator);
  }
}

