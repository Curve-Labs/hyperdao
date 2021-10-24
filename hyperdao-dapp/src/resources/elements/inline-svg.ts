import { bindable, containerless, customElement, inject, inlineView } from "aurelia-framework";

@containerless
@inlineView("<template></template>")
@customElement("inline-svg")
@inject(Element)
export class InlineSvg {
  @bindable svg: string;

  private el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  svgChanged(svg: string): void {
    if (svg) {
      this.el.parentElement.innerHTML = svg;
    }
  }
}
