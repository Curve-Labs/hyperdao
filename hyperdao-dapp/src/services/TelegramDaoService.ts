import { TransactionReceipt } from "@ethersproject/providers";
import { EthereumService } from "./EthereumService";
import TransactionsService from "./TransactionsService";
import { Hash, Address } from "./EthereumService";
import { ConsoleLogService } from "./ConsoleLogService";
import { ContractNames, ContractsService } from "./ContractsService";
import { autoinject } from "aurelia-framework";
import { api } from "./GnosisService";

@autoinject
export class TelegramDaoService {

  constructor(
    private contractsService: ContractsService,
    private consoleLogService: ConsoleLogService,
    private transactionsService: TransactionsService,
    private ethereumService: EthereumService,
  ) {
  }

  public async deployDao(chatId: string, owners: Array<Address>, threshold: number): Promise<TransactionReceipt> {
    const signer = await this.contractsService.getContractFor(ContractNames.SIGNER);
    return this.transactionsService.send(() => signer.assembleDao(chatId, owners, threshold));
  }

  public async createTransferProposal(chatId: string, to: Address, amount: string): Promise<Hash> {
    const signer = await this.contractsService.getContractFor(ContractNames.SIGNER);
    const safeAddress = signer.chatToHyperDao(chatId);
    // const safe = await this.contractsService.getContractAtAddress(ContractNames.SAFE, safeAddress);
    const gnosis = api(safeAddress, this.ethereumService.targetedNetwork);

    const transaction = {
      to,
      from: safeAddress,
      value: amount,
    } as any;

    // console.log("estimating transaction:");
    // console.dir(transaction);

    const estimate = (await gnosis.getEstimate(transaction)).data;

    Object.assign(transaction, {
      safeTxGas: estimate.safeTxGas,
      nonce: await gnosis.getCurrentNonce(),
      baseGas: 0,
      gasPrice: 0,
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      safe: safeAddress,
    });

    const { hash, signature } = await signer.callStatic.generateSignature(
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation,
      transaction.safeTxGas,
      transaction.baseGas,
      transaction.gasPrice,
      transaction.gasToken,
      transaction.refundReceiver,
      transaction.nonce,
    );

    // eslint-disable-next-line require-atomic-updates
    transaction.contractTransactionHash = hash;
    // eslint-disable-next-line require-atomic-updates
    transaction.signature = signature;

    // console.log("generating signature for transaction:");
    // console.dir(transaction);

    const result = await this.transactionsService.send(() => signer.generateSignature(
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation,
      transaction.safeTxGas,
      transaction.baseGas,
      transaction.gasPrice,
      transaction.gasToken,
      transaction.refundReceiver,
      transaction.nonce,
    ));

    if (!result) {
      return null;
    }

    // eslint-disable-next-line require-atomic-updates
    transaction.sender = signer.address;

    this.consoleLogService.logMessage(`sending to safe txHash: ${ hash }`, "info");

    const response = await gnosis.sendTransaction(transaction);

    if (response.status !== 201) {
      throw Error(`An error occurred submitting the transaction: ${response.statusText}`);
    }
  }
}
