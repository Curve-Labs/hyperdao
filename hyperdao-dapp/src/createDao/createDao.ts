import { TelegramDaoService } from "./../services/TelegramDaoService";
import { Utils } from "services/utils";
import { autoinject } from "aurelia-framework";
import { Address, EthereumService } from "services/EthereumService";
import { RouteConfig } from "aurelia-router";
import "./createDao.scss";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class createDao {
  initialOwners: Array<Address> = new Array<string>();
  newOwner: Address;
  threshold: number;
  chatId: string;
  chatTitle: string;

  constructor(
    private ethereumService: EthereumService,
    private telegramDaoService: TelegramDaoService,
    private eventAggregator: EventAggregator,
  ) {}

  activate(params: { chatId: string, chatTitle: string}, _routeConfig: RouteConfig): void {
    this.chatId = params.chatId;
    this.chatTitle = params.chatTitle;
  }

  // @computedFrom()
  get isValid(): boolean {
    return (this.threshold >= 1); //  !!(this.channnelName?.length && this.telegramHandle?.length && this.telegramHandle.startsWith("@"));
  }

  deleteOwner(ndx: number): void {
    this.initialOwners.splice(ndx, 1);
  }

  addOwner() : void {
    if (Utils.isAddress(this.newOwner) && (this.initialOwners.indexOf(this.newOwner) === -1)) {
      this.initialOwners.push(this.newOwner);
      this.newOwner = "";
    }
  }

  connect(): void {
    this.ethereumService.ensureConnected();
  }

  createDAO(): void {
    if (this.isValid && this.ethereumService.defaultAccountAddress) {
      const owners = [...this.initialOwners];
      if (owners.indexOf(this.ethereumService.defaultAccountAddress) === -1) {
        owners.push(this.ethereumService.defaultAccountAddress);
      }
      if (this.threshold <= owners.length) {
        this.telegramDaoService.deployDao(this.chatId, owners, this.threshold);
      } else {
        this.eventAggregator.publish("handleValidationError", "Threshold cannot be greater than the number of DAO members, which includes you");
      }
    }
  }
}
