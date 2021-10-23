import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, containerless, customElement, bindable } from "aurelia-framework";
import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService } from "services/EthereumService";
import { BigNumber } from "ethers";

@autoinject
@containerless
@customElement("ethbalance")
export class EthBalance {
  @bindable public placement = "top";

  private balance: BigNumber = null;
  private subscriptions = new DisposableCollection();
  private checking = false;
  private account: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService) {
  }

  public attached(): void {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account",
      (account: string) => {
        this.account = account;
        this.getBalance();
      }));
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Id",
      () => { this.initialize(); }));
    this.subscriptions.push(this.eventAggregator.subscribe("Network.NewBlock",
      () => this.getBalance()));
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.account = this.ethereumService.defaultAccountAddress;
    this.getBalance();
  }

  private detached(): void {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
  }

  private async getBalance() {
    if (!this.checking) {
      try {
        this.checking = true;
        if (this.account) {
          const provider = this.ethereumService.readOnlyProvider;
          this.balance = await provider.getBalance(this.account);
        } else {
          this.balance = null;
        }
        // tslint:disable-next-line:no-empty
        // eslint-disable-next-line no-empty
      } catch (ex) {
      } finally {
        this.checking = false;
      }
    }
  }
}
