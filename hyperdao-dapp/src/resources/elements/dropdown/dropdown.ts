import { autoinject, bindingMode, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./dropdown.scss";

@autoinject
export class Dropdown {
  /**
   * Optional function that should return the label for the selected item.
   */
  @bindable getLabel?: ({ index: number }) => any;
  @bindable.string placeholder = "Select...";
  @bindable itemChanged: ({ value: string, index: number }) => void;
  @bindable.number({ defaultBindingMode: bindingMode.twoWay }) selectedItemIndex?: number;

  private dropdown: HTMLElement;
  private dropdownOptions: Array<Element>;
  private title: HTMLElement;
  private menu: HTMLElement;
  private options: HTMLElement;
  private titleText: string;
  private divider: HTMLHRElement;

  async attached(): Promise<void> {
    document.addEventListener("click", (e: MouseEvent) => {
      // Close the menu if the user clicks outside the dropdown
      const clickedElement = e.target as HTMLElement;

      if (
        this.dropdown &&
        clickedElement.closest(".dropdown") === null && // Clicked element is not part of the dropdown element
        this.dropdown.classList.contains("show")
      ) {
        this.dropdown.classList.remove("show");
      }
    });

    this.dropdown.addEventListener("click", (e: MouseEvent) => {
      if (this.dropdownOptions && this.dropdownOptions.length) this.toggleMenuDisplay(e);
    });

    this.menuChanged();
  }

  menuChanged(): void {
    /**
     * add class to each
     */
    this.dropdownOptions = Array.from(this.options.children);
    this.dropdownOptions.forEach((item, index) => {
      if (item !== this.divider) {
        item.classList.add("option");
        item.addEventListener("click", (e) => this.handleOptionSelected(e, index));
      }
    });
    if (this.hasSelectedItemIndex) {
      this.selectItem(this.selectedItemIndex);
    }
  }

  toggleClass(elem: HTMLElement, className: string): HTMLElement {
    if (elem.classList.contains(className)) {
      elem.classList.remove(className);
    } else {
      elem.classList.add(className);
    }

    return elem;
  }

  toggleMenuDisplay(_e: Event): void {
    this.toggleClass(this.dropdown, "show");
  }

  @computedFrom("selectedItemIndex")
  get hasSelectedItemIndex(): boolean { return (typeof this.selectedItemIndex === "number") && !isNaN(this.selectedItemIndex); }

  private selectItem(index: number): void {
    this.titleText = this.getLabel ? this.getLabel({ index }) : this.dropdownOptions[index].innerHTML;

    if (this.selectedItemIndex !== index) {
      this.itemChanged({ value: this.titleText, index });
      this.selectedItemIndex = index;
    }
  }

  handleOptionSelected(_e: Event, index: number): void {
    this.selectItem(index);
  }
}
