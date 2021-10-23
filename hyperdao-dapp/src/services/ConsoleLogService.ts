import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, LogManager } from "aurelia-framework";
import { EventConfig, EventConfigException, EventConfigTransaction, EventMessageType } from "./GeneralEvents";
import { DisposableCollection } from "./DisposableCollection";

@autoinject
export class ConsoleLogService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  private subscriptions: DisposableCollection = new DisposableCollection();
  private logger = LogManager.getLogger("HyperDAO");

  constructor(
    eventAggregator: EventAggregator,
  ) {
    this.subscriptions.push(eventAggregator
      .subscribe("handleException",
        (config: EventConfigException | any) => this.handleException(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleSuccess", (config: EventConfig | string) => this.handleSuccess(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleTransaction",
        (config: EventConfigTransaction | string) => this.handleTransaction(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleWarning", (config: EventConfig | string) => this.handleWarning(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleMessage", (config: EventConfig | string) => this.handleMessage(config)));
  }

  /* shouldn't actually ever happen */
  public dispose(): void {
    this.subscriptions.dispose();
  }

  private handleSuccess(config: EventConfig | string) {
    this.logMessage(this.getMessage(config), "debug");
  }

  private handleTransaction(config: EventConfigTransaction | string) {
    if (typeof config === "string") {
      this.logMessage(config, "debug");
    } else {
      this.logMessage(`${config.message}: ${config.address}`, "debug");
    }
  }


  private getMessage(config: EventConfig | string): string {
    return (typeof config === "string") ? config : config.message;
  }

  private handleException(config: EventConfigException | any): void {
    let message;
    let ex;
    if (!(config instanceof EventConfigException)) {
      ex = config as any;
      message = `${ex?.message ? ex.message : ex}`;
    } else {
      config = config as EventConfigException;
      ex = config.exception;
      message = config.message;
    }

    this.logMessage(`${message}${ex?.stack ? `\n${ex.stack}` : ""}`, "error");
  }

  private handleFailure(config: EventConfig | string): void {
    this.logMessage(this.getMessage(config), "error");
  }

  private handleWarning(config: EventConfig | string): void {
    this.logMessage(this.getMessage(config), "warn");
  }

  private handleMessage(config: EventConfig | string): void {
    if (typeof config === "string") {
      this.logMessage(this.getMessage(config), "info");
    } else {
      switch (config.type) {
        case EventMessageType.Info:
          this.logMessage(this.getMessage(config), "info");
          break;
        case EventMessageType.Warning:
          this.logMessage(this.getMessage(config), "warn");
          break;
        case EventMessageType.Failure:
        case EventMessageType.Exception:
          this.logMessage(this.getMessage(config), "error");
          break;
        case EventMessageType.Debug:
          this.logMessage(this.getMessage(config), "debug");
          break;
      }
    }
  }

  public logMessage(msg: string, level = "info"): void {
    switch (level) {
      case "info":
      default:
        this.logger.info(msg);
        break;
      case "warn":
      case "warning":
        this.logger.warn(msg);
        break;
      case "error":
        this.logger.error(msg);
        break;
      case "debug":
        this.logger.debug(msg);
        break;
    }
  }
}
