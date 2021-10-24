const { task } = require("hardhat/config");
const { api } = require("./utils/gnosis.js");

task("addDelegate", "adds delegate to Gnosis Safe")
  .addParam("safe", "address of safe", undefined)
  .addParam("delegate", "address of delegate", undefined)
  .setAction(
    async ({ safe: safeAddress, delegate: delegateAddress }, { ethers }) => {
      console.log(
        `adding delegate ${delegateAddress} to Gnosis Safe ${safeAddress}`
      );
      const gnosis = api(safeAddress, network.name);
      const [root] = await ethers.getSigners();
      const label = "Signer";
      const totp = Math.floor(Math.floor(Date.now() / 1000) / 3600);
      const signature = await root.signMessage(
        delegateAddress + totp.toString()
      );
      const payload = {
        safe: safeAddress,
        delegate: delegateAddress,
        label,
        signature,
      };
      const result = await gnosis.addDelegate(payload);
      if (result.status == 201) {
        console.log("Successfully added");
        return;
      }
      console.log(result);
      return;
    }
  );
