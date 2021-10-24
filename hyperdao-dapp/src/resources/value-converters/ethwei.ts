import { BigNumber, BigNumberish } from "ethers";
import { fromWei, toWei } from "services/EthereumService";
/**
 * Convert between Wei (as BigNumber) in viewmodel and eth (as string) in view.
 * Note that even if the viewmodel supplies a number, modified values are saved back
 * to the viewmodel as BigNumber.
 */
export class EthweiValueConverter {

  /**
   * ETH string from HTML input ==> BigNumber for the model
   *
   * When the string cannot be converted to a number, this will return the original string.
   * This helps the user see the original mistake.  Validation will need to make sure that the
   * incorrect value is not persisted.
   *
   * @param ethValue
   * @param unitName Default is 18.  Can be decimal count or:
   *   "wei",
   *   "kwei",
   *   "mwei",
   *   "gwei",
   *   "szabo",
   *   "finney",
   *   "ether",
   */
  public fromView(ethValue: string | number, unitName: string | BigNumberish = 18): BigNumber {
    if ((ethValue === undefined) || (ethValue === null)) {
      return null;
    }

    return toWei(ethValue.toString(), unitName);
  }

  /**
   *  Wei BigNumber|string from model ==> ETH string in HTML input
   * @param weiValue
   * @param unitName Default is 18.  Can be decimal count or:
   *   "wei",
   *   "kwei",
   *   "mwei",
   *   "gwei",
   *   "szabo",
   *   "finney",
   *   "ether",
   */
  public toView(weiValue: BigNumber | string, unitName: string | BigNumberish = 18): string {
    try {
      if ((weiValue === undefined) || (weiValue === null)) {
        return "";
      }

      return fromWei(weiValue, unitName);
    } catch (ex) {
      return weiValue.toString();
    }
  }
}
