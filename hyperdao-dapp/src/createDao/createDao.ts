import { AlertService } from "./../services/AlertService";
import { TransactionReceipt } from "@ethersproject/providers";
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
  chatId: number;
  chatTitle: string;
  hyperDao: Address;

  constructor(
    private ethereumService: EthereumService,
    private telegramDaoService: TelegramDaoService,
    private eventAggregator: EventAggregator,
    private alertService: AlertService,
  ) {}

  activate(params: { chatId: string, chatTitle: string}, _routeConfig: RouteConfig): void {
    this.chatId = Number(params.chatId);
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

  async createDAO(): Promise<void> {
    if (this.isValid && this.ethereumService.defaultAccountAddress) {
      const owners = [...this.initialOwners];
      if (owners.indexOf(this.ethereumService.defaultAccountAddress) === -1) {
        owners.push(this.ethereumService.defaultAccountAddress);
      }
      if (this.threshold > owners.length) {
        this.eventAggregator.publish("handleValidationError", "Threshold cannot be greater than the number of DAO members, which includes you");
      } else if (owners.length < 2) {
        this.eventAggregator.publish("handleValidationError", "You must add at least one initial member");
      } else {
        this.hyperDao = await this.telegramDaoService.deployDao(this.chatId, owners, this.threshold);
        if (!this.hyperDao) {
          this.eventAggregator.publish("handleValidationError", "Sorry, an error occured deploying your DAO");
        }
      }
    }
  }

  async addDelegate(): Promise<void> {
    if (await this.telegramDaoService.addSafeDelegate(this.chatId)) {
      this.alertService.showAlert(`Congratulations on creating your new DAO for ${this.chatTitle}! If you want to fund it you can send funds to ${this.hyperDao}.`);
      return;
    }

  }
}
