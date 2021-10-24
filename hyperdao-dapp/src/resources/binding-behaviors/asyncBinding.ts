import { Observable, Subscription } from "rxjs";
import { bindingBehavior } from "aurelia-framework";
import { Binding } from "aurelia-binding";

export interface IAsyncAureliaBinding extends Binding {
  originalupdateTarget(value: any): void;
  _subscription?: Subscription;
}

export interface IAsyncBindingBehaviorOptions {
  catch: any;
  completed: () => void;
  error: any;
  property: string;
}

@bindingBehavior("async")
export class asyncBindingBehavior {

  getPropByPath(obj: string, keyPath: string): string {
    return keyPath
      .split(".")
      .reduce((prev, curr) => prev[curr], obj);
  }

  bind(binding: IAsyncAureliaBinding, _source: string, options?: IAsyncBindingBehaviorOptions): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    binding.originalupdateTarget = binding.updateTarget || (() => { });

    binding.updateTarget = (a) => {
      if (a && typeof a.then === "function") {
        a.then((res: any) => binding.originalupdateTarget(options && options.property ? this.getPropByPath(res, options.property) : res));

        if (options && options.catch) {
          a.catch((res: any) => typeof options.catch === "function"
            ? options.catch(res)
            : binding.originalupdateTarget(options.catch));
        }
      } else if (a instanceof Observable) {
        const error = options
          ? typeof options.error === "function"
            ? options.error
            : () => { binding.originalupdateTarget(options && options.property ? this.getPropByPath(options.error, options.property) : options.error); }
          : undefined;

        binding._subscription = a.subscribe(
          {
            next: (res) => {
              binding.originalupdateTarget(options && options.property ? this.getPropByPath(res, options.property) : res);
            },
            error: error,
            complete: options ? options.completed : undefined,
          } );
      }
      else {
        binding.originalupdateTarget(a);
      }
    };
  }

  unbind(binding: IAsyncAureliaBinding): void {
    binding.updateTarget = binding.originalupdateTarget;
    (binding as any).originalupdateTarget = undefined;

    if (binding._subscription &&
      typeof binding._subscription.unsubscribe === "function") {
      binding._subscription.unsubscribe();
    }
  }
}
