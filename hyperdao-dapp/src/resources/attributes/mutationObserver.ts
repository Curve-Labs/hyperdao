import { autoinject, customAttribute } from "aurelia-framework";

/**
 * Observe any changes in the content of the attributed element.
 * Superior to observing innerHTML because it works when the content is
 * coming from a slot (shadow DOM).
 * Usage:
 * <template>
 *   <div mutation-observer.call="someViewModelMethod()"><slot></slot></div>
 * </template>
 */
@autoinject
@customAttribute("mutation-observer")
export class MutationObserverAttribute {

  private observer: MutationObserver;
  private value: MutationCallback;

  constructor(private element: Element) {
    this.element = element;
  }

  attached(): void {
    this.observer = new MutationObserver(this.value);
    this.observer.observe(this.element, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  detached(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
