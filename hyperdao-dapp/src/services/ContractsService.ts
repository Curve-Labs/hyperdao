import { BigNumber, Contract, ethers, Signer } from "ethers";
import { Address, EthereumService, Hash, IBlockInfoNative, IChainEventInfo } from "services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";

export enum ContractNames {
  SAFE = "Safe",
  SIGNER = "SignerV2"
}

export interface IStandardEvent<TArgs> {
  args: TArgs;
  transactionHash: Hash;
  blockNumber: number;
  getBlock(): Promise<IBlockInfoNative>;
}

@autoinject
export class ContractsService {

  private static Contracts = new Map<ContractNames, Contract>([
    [ContractNames.SAFE, null],
    [ContractNames.SIGNER, null],
  ]);

  private initializingContracts: Promise<void>;
  private initializingContractsResolver: () => void;
  private networkInfo: IChainEventInfo;
  private accountAddress: Address;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService) {

    this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
      if (account !== this.accountAddress) {
        this.accountAddress = account;
        this.initializeContracts();
      }
    });

    const networkChange = (info) => {
      if ((this.networkInfo?.chainId !== info?.chainId) ||
        (this.networkInfo?.chainName !== info?.chainName) ||
        (this.networkInfo?.provider !== info?.provider)) {
        this.networkInfo = info;
      }
    };

    this.eventAggregator.subscribe("Network.Changed.Disconnect", (): void => {
      networkChange(null);
    });

    this.eventAggregator.subscribe("Network.Changed.Connected", (info: IChainEventInfo): void => {
      networkChange(info);
    });

    this.eventAggregator.subscribe("Network.Changed.Id", (info: IChainEventInfo): void => {
      networkChange(info);
    });

    this.initializeContracts();
  }

  private setInitializingContracts(): void {
    if (!this.initializingContractsResolver) {
    /**
     * jump through this hook because the order of receipt of `EthereumService.onConnect`
     * is indeterminant, but we have to make sure `ContractsService.initializeContracts`
     * has completed before someone tries to use `this.Contracts` (see `getContractFor`).
     */
      this.initializingContracts = new Promise<void>((resolve: () => void) => {
        this.initializingContractsResolver = resolve;
      });
    }
  }

  private resolveInitializingContracts(): void {
    this.initializingContractsResolver();
    this.initializingContractsResolver = null;
  }

  private async assertContracts(): Promise<void> {
    return this.initializingContracts;
  }

  public createProvider(): any {
    let signerOrProvider;
    if (this.accountAddress && this.networkInfo?.provider) {
      signerOrProvider = Signer.isSigner(this.accountAddress) ? this.accountAddress : this.networkInfo.provider.getSigner(this.accountAddress);
    } else {
      signerOrProvider = this.ethereumService.readOnlyProvider;
    }
    return signerOrProvider;
  }

  private initializeContracts(): void {
    /**
     * to assert that contracts are not available during the course of this method
     */
    if (!this.initializingContractsResolver) {
      this.setInitializingContracts();
    }

    const reuseContracts = // at least one arbitrary contract already exists
      ContractsService.Contracts.get(ContractNames.SAFE);

    const signerOrProvider = this.createProvider();

    ContractsService.Contracts.forEach((_contract, contractName) => {
      let contract;

      if (reuseContracts) {
        contract = ContractsService.Contracts.get(contractName).connect(signerOrProvider);
      } else {
        contract = new ethers.Contract(
          ContractsService.getContractAddress(contractName),
          ContractsService.getContractAbi(contractName),
          signerOrProvider);
      }
      ContractsService.Contracts.set(contractName, contract);
    });

    this.eventAggregator.publish("Contracts.Changed");

    this.resolveInitializingContracts();
  }

  public async getContractFor(contractName: ContractNames): Promise<Contract & any> {
    await this.assertContracts();
    return ContractsService.Contracts.get(contractName);
  }

  public static getContractAbi(contractName: ContractNames): Array<any> {
    return ContractsDeploymentProvider.getContractAbi(contractName);
  }

  public static getContractAddress(contractName: ContractNames): Address {
    return ContractsDeploymentProvider.getContractAddress(contractName);
  }

  public getContractAtAddress(contractName: ContractNames, address: Address): Contract & any {
    return new ethers.Contract(
      address,
      ContractsService.getContractAbi(contractName),
      this.createProvider());
  }

  // org.zeppelinos.proxy.implementation
  private static storagePositionZep = "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3";

  // eip1967.proxy.implementation
  private static storagePosition1967 = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";


  /**
   * Attempts to obtain the addresss of a proxy contract implementation.
   * Uses a heuristic described here:
   *     https://ethereum.stackexchange.com/questions/103143/how-do-i-get-the-implementation-contract-address-from-the-proxy-contract-address
   *
   * More info here:
   *     https://medium.com/etherscan-blog/and-finally-proxy-contract-support-on-etherscan-693e3da0714b
   *
   * @param proxyContract
   * @returns null if not found
   */
  public async getProxyImplementation(proxyContract: Address): Promise<Address> {

    let result = await this.ethereumService.readOnlyProvider.getStorageAt(proxyContract, ContractsService.storagePositionZep);
    if (BigNumber.from(result).isZero()) {
      result = await this.ethereumService.readOnlyProvider.getStorageAt(proxyContract, ContractsService.storagePosition1967);
    }

    const bnResult = BigNumber.from(result);

    return bnResult.isZero() ? null : bnResult.toHexString();
  }
}
