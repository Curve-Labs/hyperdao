import { autoinject } from "aurelia-framework";
import { EventConfig, EventConfigException } from "./GeneralEvents";
import { DialogCloseResult, DialogService } from "./DialogService";
import { DisposableCollection } from "./DisposableCollection";
import { Alert, ShowButtonsEnum } from "../resources/dialogs/alert/alert";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class AlertService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  private subscriptions: DisposableCollection = new DisposableCollection();

  constructor(
    private eventAggregator: EventAggregator,
    private dialogService: DialogService,
  ) {
  }

  shouldHandleErrors(): void {
    this.subscriptions.push(this.eventAggregator
      .subscribe("handleException",
        (config: EventConfigException | any) => this.handleException(config)));
    this.subscriptions.push(this.eventAggregator
      .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
  }

  private handleException(config: EventConfigException | any) {
    let ex: any;
    let message: string;
    if (!(config instanceof EventConfigException)) {
      // then config is the exception itself
      ex = config as any;
    } else {
      ex = config.exception;
      message = config.message;
    }

    this.showAlert(`${message ? `${message}: ` : ""}${ex?.reason ?? ex?.message ?? ex}`);
  }

  private handleFailure(config: EventConfig | string) {
    this.showAlert(this.getMessage(config));
  }

  private getMessage(config: EventConfig | string): string {
    return (typeof config === "string") ? config : config.message;
  }

  public showAlert(message: string, buttons = ShowButtonsEnum.OK): Promise<DialogCloseResult> {
    /**
     * hack we gotta go through because of how the gradient border, size
     * and position of the dialog is defined in ux-dialog-container.
     * See alert.scss and dialogs.scss.  We have no other way to selectively
     * alter the css of that element.  Once alert.scss is loaded, it forever overrides
     * the default styling on ux-dialog-container.
     */
    let theContainer: Element;

    return this.dialogService.open(Alert, { message, buttons }, {
      keyboard: true,
      position: (modalContainer: Element, _modalOverlay: Element): void => {
        theContainer = modalContainer;
        modalContainer.classList.add("alert");
      },
    })
      .whenClosed(
        (result: DialogCloseResult) => {
          theContainer.classList.remove("alert");
          return result;
        },
        // not sure if this works for alert
        (error: string) => { return { output: error, wasCancelled: false }; });
  }
}
