import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, bindingMode, customElement } from "aurelia-framework";
import { EthereumService } from "../../../services/EthereumService";

@autoinject
@customElement("usersaddress")
export class UsersAddress {

  /**
   * bootstrap config for a tooltip
   */
  @bindable({ defaultBindingMode: bindingMode.oneTime }) public tooltip?: any;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) public small?: boolean;

  private usersAddress: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService) {
    this.eventAggregator.subscribe("Network.Changed.Account", () => { this.initialize(); });
    this.initialize();
  }

  private async initialize() {
    this.usersAddress = this.ethereumService.defaultAccountAddress;
  }
}
