import {
  autoinject,
  computedFrom,
  containerless,
} from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { NumberService } from "services/NumberService";
import tippy from "tippy.js";

@autoinject
@containerless
export class FormattedNumber {

  //  @bindable public format?: string;
  /**
   * how many significant digits we want to display
   */
  // @bindable public precision?: string | number;
  @bindable.booleanAttr public average = false;
  /**
   * places after the decimal, padded with zeroes if needed
   */
  @bindable public mantissa?: string | number;
  @bindable public value: number | string;
  @bindable public placement = "top";
  @bindable public defaultText = "--";
  @bindable.booleanAttr public thousandsSeparated = false;


  private text: string;
  private textElement: HTMLElement;
  private _value: number | string;
  private tippyInstance: any;

  constructor(private numberService: NumberService) {
  }

  public valueChanged(): void {
    if ((this.value === undefined) || (this.value === null)) {
      this.text = this.defaultText;
      return;
    }

    this._value = this.value;

    let text = null;

    if ((this._value !== null) && (this._value !== undefined)) {
      text = this.numberService.toString(Number(this._value),
        {
          // precision: this.precision,
          average: this.average,
          mantissa: this.mantissa,
          thousandSeparated: this.thousandsSeparated,
        },
      );
    }

    this.text = text ?? this.defaultText;

    this.setTooltip();
  }

  public attached(): void {
    this.setTooltip();
  }

  // public detached(): void {
  //   tippy(this.textElement, "dispose");
  // }

  @computedFrom("_value")
  private get tooltip():string {
    return this._value?.toString(10);
  }

  private setTooltip() {
    if (this.textElement && this.value) {
      if (!this.tippyInstance) {
      // tippy(this.textElement, "dispose");
        this.tippyInstance = tippy(this.textElement, {
          appendTo: () => document.body, // because is "interactive" and otherwise messes with the layout on hover
          zIndex: 10005,
        });
      }
      this.tippyInstance.setContent(this.value.toString());
    }
  }
}
