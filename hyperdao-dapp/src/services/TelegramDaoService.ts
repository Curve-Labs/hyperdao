import { EthereumService, NULL_HASH } from "./EthereumService";
import TransactionsService from "./TransactionsService";
import { Hash, Address } from "./EthereumService";
import { ConsoleLogService } from "./ConsoleLogService";
import { ContractNames, ContractsService } from "./ContractsService";
import { autoinject } from "aurelia-framework";
import { api } from "./GnosisService";
import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";

@autoinject
export class TelegramDaoService {

  constructor(
    private contractsService: ContractsService,
    private consoleLogService: ConsoleLogService,
    private transactionsService: TransactionsService,
    private ethereumService: EthereumService,
  ) {
  }

  public async deployDao(chatId: number, owners: Array<Address>, threshold: number): Promise<Address> {
    const signer = await this.contractsService.getContractFor(ContractNames.SIGNER);
    const receipt = await this.transactionsService.send(() => signer.assembleDao(chatId, owners, threshold));
    return receipt ? getAddress(await signer.chatToHyperDao(chatId)) : null;
  }

  public async createTransferProposal(chatId: number, to: Address, amount: string | BigNumber): Promise<Hash> {
    const signer = await this.contractsService.getContractFor(ContractNames.SIGNER);
    const safeAddress = getAddress(await signer.chatToHyperDao(chatId));
    // const safe = await this.contractsService.getContractAtAddress(ContractNames.SAFE, safeAddress);
    const gnosis = api(safeAddress, this.ethereumService.targetedNetwork);

    const transaction = {
      to,
      from: safeAddress,
      value: amount.toString(),
      operation: 0,
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
      data: "0x",
    });

    const { hash, signature } = await signer.callStatic.generateSignature(
      chatId,
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation,
      transaction.safeTxGas,
      transaction.baseGas,
      transaction.gasPrice,
      transaction.nonce,
    );

    // eslint-disable-next-line require-atomic-updates
    transaction.contractTransactionHash = hash;
    // eslint-disable-next-line require-atomic-updates
    transaction.signature = signature;

    // console.log("generating signature for transaction:");
    // console.dir(transaction);

    const result = await this.transactionsService.send(() => signer.generateSignature(
      chatId,
      transaction.to,
      transaction.value,
      transaction.data,
      transaction.operation,
      transaction.safeTxGas,
      transaction.baseGas,
      transaction.gasPrice,
      transaction.nonce,
    ));

    if (!result) {
      this.consoleLogService.logMessage("An error occurred signing the transaction");
      return null;
    }

    // eslint-disable-next-line require-atomic-updates
    transaction.sender = getAddress(signer.address);

    this.consoleLogService.logMessage(`sending to safe txHash: ${ hash }`, "info");

    // console.log("sending transaction to Safe:");
    // console.dir(transaction);

    const response = await gnosis.sendTransaction(transaction);

    if (response.status !== 201) {
      this.consoleLogService.logMessage(`An error occurred submitting the transaction: ${response.statusText}`);
      return null;
    }

    return hash;
  }

  public async vote(chatId: number, txHash: Hash): Promise<void> {
    const signer = this.ethereumService.getDefaultSigner();
    const signature = signer.signMessage(txHash);
    const signerContract = await this.contractsService.getContractFor(ContractNames.SIGNER);

    const safeAddress = getAddress(await signerContract.chatToHyperDao(chatId));
    const gnosis = api(safeAddress, this.ethereumService.targetedNetwork);

    gnosis.addConfirmation({ signature }, txHash);
  }

  public async addSafeDelegate(chatId: number): Promise<boolean> {
    const signerContract = await this.contractsService.getContractFor(ContractNames.SIGNER);
    const safeAddress = getAddress(await signerContract.chatToHyperDao(chatId));
    const delegateAddress = signerContract.address;
    const signer = this.ethereumService.getDefaultSigner();
    if (!signer) {
      throw new Error("addSafeDelegate: need a signer");
    }
    // console.log(
    //   `adding delegate ${delegateAddress} to Gnosis Safe ${safeAddress}`
    // );
    const gnosis = api(safeAddress, this.ethereumService.targetedNetwork);
    const label = "Signer";
    const totp = Math.floor(Math.floor(Date.now() / 1000) / 3600);
    const signature = await signer.signMessage(delegateAddress + totp.toString());
    const payload = {
      safe: safeAddress,
      delegate: delegateAddress,
      label,
      signature,
    };
    const result = await gnosis.addDelegate(payload);
    if (result.status === 201) {
      // console.log("Successfully added");
      return true;
    }
    // console.log(result);
    return false;
  }
}
