import { containerless } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./circledNumber.scss";

@containerless
export class CircledNumber {
  @bindable.number number: number;
  @bindable.booleanAttr checkMark: boolean;
  @bindable.booleanAttr active: boolean;
}
