import {autoinject} from "aurelia-framework";
import { NumberService } from "../../services/NumberService";

/**
 * when a number is retrieved from the element to which it is bound, convert it from a string to a number.
 */
@autoinject
export class NumberValueConverter {

  constructor(private numberService: NumberService) { }

  /**
     * When the string cannot be converted to a number, this will return the original string.
     * This helps the user see the original mistake.  Validation will need to make sure that the
     * incorrect value is not persisted.
     * @param value
     */
  public fromView(value: string): number {
    return this.numberService.fromString(value);
  }
}
