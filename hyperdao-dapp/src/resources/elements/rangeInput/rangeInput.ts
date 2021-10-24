import { autoinject, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./rangeInput.scss";

interface IValues {
  projectToken: number,
  fundingToken: number,
}
@autoinject
export class RangeInput {
  @bindable.string private maxAllowed? = 100;
  @bindable.string private name;
  @bindable.number public value = this.maxAllowed || 50;
  @bindable.ref private rangeInput: HTMLInputElement;
  @bindable.string private fundingToken = "";
  @bindable.string private projectToken = "";

  @computedFrom("value", "maxAllowed")
  get values(): IValues {
    const validValue = (this.maxAllowed) > this.value ? this.value : this.maxAllowed;

    const style = `linear-gradient(
      90deg, 
      #a258a7 0%, 
      #ff497a ${validValue}%, 
      #8668fc ${validValue}%, 
      #a258a7 100%
    )`;

    this.rangeInput.style.setProperty("--track-background", style);

    return {
      projectToken: validValue,
      fundingToken: 100 - validValue,
    };
  }
}


