import { Container } from "aurelia-dependency-injection";
import { autoinject, BindingEngine, TemplatingEngine, ICollectionObserverSplice } from "aurelia-framework";
import { IDisposable } from "services/IDisposable";

@autoinject
export class AureliaHelperService {

  constructor(
    public container: Container,
    private templatingEngine: TemplatingEngine,
    private bindingEngine: BindingEngine,
  ) {

  }

  /**
 * Make property bindable
 * @param object
 * @param propertyName
 */
  // public makePropertyObservable(object: unknown, propertyName: string): void {
  //   this.bindingEngine.propertyObserver(object, propertyName);
  // }

  /**
   * Create an observable property and subscribe to changes
   * @param object
   * @param propertyName
   * @param func
   */
  public createPropertyWatch(
    object: unknown,
    propertyName: string,
    func: (newValue: any, oldValue: any) => void): IDisposable {
    return this.bindingEngine.propertyObserver(object, propertyName)
      .subscribe((newValue, oldValue) => {
        func(newValue, oldValue);
      });
  }

  /**
   * The callback will receive an array of splices which provides information about the change that was detcted.
   * The properties of the splice may vary depending on the type of collection being observed.
   * See for example: https://aurelia.io/docs/binding/observable-properties#observing-collections
   * @param collection
   * @param func handler
   */
  public createCollectionWatch(
    collection: Array<any> | Set<any> | Map<any, any>,
    func: (splices: Array<ICollectionObserverSplice<string>>) => void): IDisposable {

    return this.bindingEngine
      .collectionObserver(collection as any) // `as any` because I think the collectionObserver declares is wrong, should accept `Set<any`
      .subscribe(func);
  }

  /**
   * bind the html element located by the path given by elementSelector.
   * @param elementSelector
   * @param bindingContext -- The viewmodel against which the binding should run
   */
  public enhance(elementSelector: string, bindingContext: unknown): void {
    const el = document.querySelector(elementSelector);
    this.enhanceElement(el, bindingContext);

  }

  public enhanceElement(el: Element, bindingContext: unknown, reEnhance = false): void {
    if (el) {
      if (reEnhance) {
        el.classList.remove("au-target");
      }
      this.templatingEngine.enhance({ element: el, bindingContext });
    }
  }
}
