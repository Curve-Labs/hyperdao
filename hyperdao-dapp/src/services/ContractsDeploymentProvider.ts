import { AllowedNetworks } from "./EthereumService";
import { Address } from "services/EthereumService";
import { autoinject } from "aurelia-framework";

interface IContractInfo {
  address: Address;
  abi: Array<any>;
}

interface IContractInfosJson {
  name: AllowedNetworks;
  chainId: number;
  contracts: {
    [name: string]: IContractInfo;
  }
}

interface ISharedContractInfos {
  [name: string]: Array<any>;
}

@autoinject
export class ContractsDeploymentProvider {

  private static contractInfosJson: IContractInfosJson;
  private static sharedContractAbisJson: ISharedContractInfos;

  public static initialize(targetedNetwork: string): void {
    if (!ContractsDeploymentProvider.contractInfosJson) {
      ContractsDeploymentProvider.contractInfosJson = require(`../contracts/${targetedNetwork}.json`) as IContractInfosJson;
    }

    if (!ContractsDeploymentProvider.sharedContractAbisJson) {
      ContractsDeploymentProvider.sharedContractAbisJson = require("../contracts/sharedAbis.json") as ISharedContractInfos;
    }
  }

  public static getContractAbi(contractName: string): Array<any> {
    let abi = ContractsDeploymentProvider.contractInfosJson.contracts[contractName]?.abi;
    if (typeof abi === "string") {
      // is name of shared abi, such as ERC20
      abi = ContractsDeploymentProvider.sharedContractAbisJson[abi];
    } else if (!abi) {
      abi = ContractsDeploymentProvider.sharedContractAbisJson[contractName];
    }
    return abi;
  }

  public static getContractAddress(contractName: string): Address {
    return ContractsDeploymentProvider.contractInfosJson.contracts[contractName]?.address;
  }
}
