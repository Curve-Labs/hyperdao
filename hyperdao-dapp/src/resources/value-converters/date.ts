import { autoinject } from "aurelia-framework";
import { DateService, IFormatParameters } from "../../services/DateService";

@autoinject
export class DateValueConverter {
  constructor(private dateService: DateService) {

  }

  /**
   * convert between Date in the viewmodel and a string in the specified format for the view.
   * Format can be a key into config.
   */
  public toView(value: Date, format: IFormatParameters | string = "table-date"): string | null {
    return this.dateService.toString(value, format);
  }

  public fromView(value: string, format: IFormatParameters | string = "table-date"): Date | null {
    return this.dateService.fromString(value, format);

  }
}
