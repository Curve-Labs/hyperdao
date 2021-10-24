import { autoinject } from "aurelia-framework";
import { DateService, TimespanResolution } from "../../services/DateService";

@autoinject
export class TimespanValueConverter {
  constructor(private dateService: DateService) {

  }
  /**
   * convert between milliseconds in the viewmodel and a string.
   */
  public toView(value: number, resolution?: TimespanResolution, largest = false, abbrev = false): string | null {
    if (typeof resolution === "string") {
      resolution = TimespanResolution[resolution as string];
    }
    if (resolution && largest) {
      // eslint-disable-next-line no-bitwise
      resolution |= TimespanResolution.largest;
    }
    return this.dateService.ticksToTimeSpanString(value, resolution, abbrev);
  }
}
