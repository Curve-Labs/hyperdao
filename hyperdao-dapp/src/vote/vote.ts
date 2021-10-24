import { Address, EthereumService, Hash } from "./../services/EthereumService";
import { autoinject } from "aurelia-framework";
import { BigNumber } from "ethers";
import { RouteConfig } from "aurelia-router";
import "./vote.scss";
import { TelegramDaoService } from "services/TelegramDaoService";

@autoinject
export class Vote {
  chatId: number;
  proposalId: Address;

  constructor(
    private ethereumService: EthereumService,
    private telegramDaoService: TelegramDaoService,
  ) {}

  activate(params: { chatId: string, proposalId: Hash}, _routeConfig: RouteConfig): void {
    this.chatId = Number(params.chatId);
    this.proposalId = params.proposalId;
  }

  connect(): void {
    this.ethereumService.ensureConnected();
  }

  vote(): void {
    this.telegramDaoService.vote(this.chatId, this.proposalId);
  }
}
