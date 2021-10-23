import { CssAnimator } from "aurelia-animator-css";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, containerless } from "aurelia-framework";
import { EventConfig, EventConfigException, EventConfigTransaction, EventMessageType } from "../../../services/GeneralEvents";
import { from, Subject } from "rxjs";
import { concatMap } from "rxjs/operators";
import { AureliaHelperService } from "services/AureliaHelperService";
import { DisposableCollection } from "services/DisposableCollection";
import "./banner.scss";
import { Utils } from "services/utils";

@containerless
@autoinject
export class Banner {

  private resolveToClose: () => void;
  private okButton: HTMLElement;
  private showing = false;
  private banner: HTMLElement;
  private elMessage: HTMLElement;
  private subscriptions: DisposableCollection = new DisposableCollection();
  private queue: Subject<IBannerConfig>;
  private timeoutId: any;
  private stdTimeout = 6000;
  // private etherScanTooltipConfig = {
  //   placement: "bottom",
  //   title: "Click to go to etherscan.io transaction information page",
  //   toggle: "tooltip",
  //   trigger: "hover",
  // };

  constructor(
    eventAggregator: EventAggregator,
    private animator: CssAnimator,
    private aureliaHelperService: AureliaHelperService,
  ) {
    this.subscriptions.push(eventAggregator
      .subscribe("handleException", (config: EventConfigException | any) => this.handleException(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleValidationError", (config: EventConfig | string) => this.handleValidationError(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleInfo", (config: EventConfig | string) => this.handleInfo(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("showMessage", (config: EventConfig | string) => this.handleInfo(config)));

    eventAggregator.subscribe("transaction.failed", (ex) => this.handleException(ex));
    eventAggregator.subscribe("transaction.confirmed", (config: EventConfigTransaction) => this.handleTransaction(config));

    this.queue = new Subject<IBannerConfig>();
    /**
     * messages added to the queue will show up here, generating a new queue
     * of observables whose values don't resolve until they are observed
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    this.queue.pipe(concatMap((config: IBannerConfig) => {
      return from(new Promise((resolve: (value: unknown) => void) => {
        // with timeout, give a cleaner buffer in between consecutive snacks
        setTimeout(() => this.showBanner(config, () => resolve(0)), 200);
      }));
    }))
      // this will initiate the execution of the promises
      // each promise is executed after the previous one has resolved
      .subscribe();
  }

  private async showBanner(config: IBannerConfig, resolve: () => void) {
    switch (config.type) {
      case EventMessageType.Info:
        this.banner.classList.remove("failure");
        this.banner.classList.remove("warning");
        this.banner.classList.add("info");
        break;
      case EventMessageType.Warning:
        this.banner.classList.remove("info");
        this.banner.classList.remove("failure");
        this.banner.classList.add("warning");
        break;
      default:
        this.banner.classList.remove("warning");
        this.banner.classList.remove("info");
        this.banner.classList.add("failure");
        break;
    }
    this.elMessage.innerHTML = config.message;
    this.aureliaHelperService.enhanceElement(this.elMessage, this, true);
    this.resolveToClose = resolve;
    await this.animator.addClass(this.banner, "au-enter-active");
    if (config.timer) {
      this.timeoutId = setInterval(() => this.close(), config.timer);
    }
    this.showing = true;
  }

  // public attached(): void {
  //   // attach-focus doesn't work
  //   //this.okButton.focus();
  // }

  public dispose(): void {
    this.subscriptions.dispose();
  }

  private async close(): Promise<void> {
    if (this.resolveToClose) {
      await this.animator.leave(this.banner);
      this.showing = false;
      this.resolveToClose();
      this.resolveToClose = null;
      if (this.timeoutId) {
        clearInterval(this.timeoutId);
        this.timeoutId = 0;
      }
    }
  }

  private handleTransaction(config: EventConfigTransaction) {
    if ((config as any).originatingUiElement) {
      return;
    }

    const message = `${config.message}: <span class="transactionHash"><etherscanlink text="${Utils.smallHexString(config.receipt.transactionHash)}" address="${config.receipt.transactionHash}" type="tx"></etherscanlink></span>`;

    this.queueEventConfig({
      message,
      type: EventMessageType.Info,
      timer: 10000,
    });
  }

  private handleException(config: EventConfigException | any): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    let ex: any;
    let message: string;
    if (!(config instanceof EventConfigException)) {
      // then config is the exception itself
      ex = config as any;
    } else {
      ex = config.exception;
      message = config.message;
    }

    this.queueEventConfig({ message: `${message ? `${message}: ` : ""}${ex?.reason ?? ex?.message ?? ex}`, type: EventMessageType.Exception });
  }

  private handleFailure(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      type: EventMessageType.Failure,
    };

    this.queueEventConfig(bannerConfig);
  }

  private handleValidationError(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      type: EventMessageType.Warning,
      timer: this.stdTimeout,
    };

    this.queueEventConfig(bannerConfig);
  }


  private handleInfo(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      type: EventMessageType.Info,
      timer: this.stdTimeout,
    };

    this.queueEventConfig(bannerConfig);
  }

  private queueEventConfig(config: IBannerConfig): void {
    // TODO: enable these to stack vertically
    this.queue.next(config);
  }
}

interface IBannerConfig {
  type: EventMessageType;
  message: string;
  timer?: number;
}
