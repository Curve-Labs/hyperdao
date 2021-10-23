import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, containerless, customElement, singleton } from "aurelia-framework";
import { DisposableCollection } from "services/DisposableCollection";
import { Address, EthereumService } from "services/EthereumService";
import { EventConfigTransaction } from "services/GeneralEvents";
import { TransactionReceipt } from "services/TransactionsService";
import "./ConnectButton.scss";
import { bindable } from "aurelia-typed-observable-plugin";
import { Utils } from "services/utils";

enum Phase {
  None = "None",
  Mining = "Mining",
  Confirming = "Confirming"
}

@singleton(false)
@containerless
@autoinject
@customElement("connectbutton")
export class ConnectButton {

  private subscriptions: DisposableCollection = new DisposableCollection();
  private accountAddress: Address = null;
  private txPhase = Phase.None;
  private txReceipt: TransactionReceipt;
  private primeAddress: Address;
  @bindable.booleanAttr private hideBalances: boolean;

  constructor(
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (account: Address) => {
      this.accountAddress = account;
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.sent", async () => {
      this.txPhase = Phase.Mining;
      this.txReceipt = null;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.mined", async (event: EventConfigTransaction) => {
      this.txPhase = Phase.Confirming;
      this.txReceipt = event.receipt;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.confirmed", async () => {
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.failed", async () => {
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }));

    this.accountAddress = this.ethereumService.defaultAccountAddress || null;
  }

  public dispose(): void {
    this.subscriptions.dispose();
  }

  private onConnect() {
    return this.ethereumService.ensureConnected();
  }

  private gotoTx() {
    if (this.txReceipt) {
      Utils.goto(this.ethereumService.getEtherscanLink(this.txReceipt.transactionHash, true));
    }
  }
}
