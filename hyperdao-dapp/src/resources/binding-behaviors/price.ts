// import { autoinject } from "aurelia-framework";
// import { Address } from "services/EthereumService";
// import { PriceService } from "services/PriceService";

// @autoinject
// export class PriceBehavior {

//   constructor(private priceService: PriceService) {}

//   public bind(binding: any, _source): void {
//     binding.originalUpdateTarget = binding.updateTarget;
//     binding.updateTarget = (tokenAddress: Address) => this.priceService.getTokenPrice(tokenAddress);
//   }

//   public unbind(binding: any): void {
//     binding.updateTarget = binding.originalUpdateTarget;
//     binding.originalUpdateTarget = null;
//   }
// }


