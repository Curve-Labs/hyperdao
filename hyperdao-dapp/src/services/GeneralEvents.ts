import { TransactionReceipt } from "@ethersproject/providers";

export class EventConfig {

  public style = "snack-info";
  /**
   * in milliseconds, default 3000, 0 for never
   */
  public duration = 3000;
  public actionType: ActionType = ActionType.none;

  public action: () => void;
  public actionText: string;
  /**
   * for when ActionType is address.
   */
  public address: string;
  /**
   * "tx" or "address", when actionType is address.  Default is "address"
   */
  public addressType: string;
  /**
   * Element from with the error originated.  Supply this only to obtain UI-specific behavior,
   * like balloons.  Currently only for failures and exceptions.
   */
  public originatingUiElement: HTMLElement;
  /**
   * for when action is Exception
   */
  public exception: any;
  constructor(
    public message: string,
    public type: EventMessageType = EventMessageType.Info,
    lifetime: Lifetime = Lifetime.transitory,
  ) {

    switch (lifetime) {
      case Lifetime.clickToDismiss:
      case Lifetime.closeButton:
        this.duration = 0;
        break;
      case Lifetime.transitory:
        this.duration = 3000;
        break;
      case Lifetime.none:
        this.duration = -1; // means no snack
        break;
    }

    switch (type) {
      case EventMessageType.Info:
      case EventMessageType.Debug:
      default:
        this.style = "snack-info";
        break;
      case EventMessageType.Warning:
        this.style = "snack-warning";
        break;
      case EventMessageType.Failure:
      case EventMessageType.Exception:
        this.style = "snack-failure";
        break;
    }
  }
}

export class EventConfigFailure extends EventConfig {
  constructor(
    message = "An error occurred",
    originatingUiElement?: HTMLElement,
  ) {
    super(message, EventMessageType.Failure, Lifetime.closeButton);
    this.message = `${this.message}`;
    this.originatingUiElement = originatingUiElement;
  }
}

export class EventConfigException extends EventConfig {
  constructor(
    message = "An error occurred",
    public exception: unknown,
    originatingUiElement?: HTMLElement,
  ) {
    super(message, EventMessageType.Exception, Lifetime.closeButton);
    // the stack trace, etc, will be logged by ConsoleLogService
    this.message = message;
    this.originatingUiElement = originatingUiElement;
  }
}

export class EventConfigAction extends EventConfig {
  constructor(
    message: string,
    /**
     * text for control
     */
    public actionText: string,
    /**
     * called when control is clicked
     */
    public action: () => void,
    type: EventMessageType = EventMessageType.Info,
    lifetime: Lifetime = Lifetime.clickToDismiss,
  ) {
    super(message, type, lifetime);
    this.actionType = ActionType.button;
  }
}

export class EventConfigAddress extends EventConfig {
  constructor(
    message: string,
    public address: string,
    /**
     * text to display instead of address
     */
    public actionText: string,
  ) {
    super(message, EventMessageType.Info, Lifetime.clickToDismiss);
    this.actionType = ActionType.address;
    this.addressType = "address";
  }
}

export class EventConfigTransaction extends EventConfig {
  constructor(
    message: string,
    public receipt: TransactionReceipt,
  ) {
    super(message);
    /**
     * automatically disappear after 5 seconds
     */
    this.duration = 5000;
    this.actionType = ActionType.none;
  }
}

export enum ActionType {
  none = 0,
  /**
   * provide action for onclick
   */
  button = 1,
  /**
   * actionText is an address, make it hot/copyable
   */
  address = 2,
}

export enum Lifetime {
  none = 0,
  transitory = 1,
  clickToDismiss = 2,
  closeButton = 3,
}

export enum EventMessageType {
  none = 0,
  Failure = 1,
  Exception = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
}
