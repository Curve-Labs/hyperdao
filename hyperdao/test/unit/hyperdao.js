const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { utils, BigNumber } = require("ethers");

const getContractInstance = async (factoryName, address, args) => {
  const Factory = await ethers.getContractFactory(factoryName, address);
  const parameters = args ? args : [];
  return await Factory.deploy(...parameters);
};

describe("Contract: HyperDao", async () => {
  let hyperDaoFactoryFactory, hyperDaoInstance, params, safeData, ownersArray;
  let root, owner1, owner2, owner3;
  let gnosisSafeInstance, gnosisSafeProxyInstance, gnosisSafeContractFactory;

  const CHANNEL_ID = -1001741603151;
  const threshold = 2;
  context("deploy new dao", () => {
    before("setup", async () => {
      const signers = await ethers.getSigners();
      [root, owner1, owner2, owner3] = signers;

      gnosisSafeInstance = await getContractInstance(
        "GnosisSafe",
        root.address
      );

      gnosisSafeContractFactory = await ethers.getContractFactory("GnosisSafe");

      gnosisSafeProxyInstance = await getContractInstance(
        "GnosisSafeProxyFactory",
        root.address
      );

      safeData = "0x";

      ownersArray = [owner1.address, owner2.address, owner3.address];

      hyperDaoFactoryFactory = await ethers.getContractFactory("HyperDAO");
      hyperDaoInstance = await hyperDaoFactoryFactory.deploy(
        gnosisSafeInstance.address,
        gnosisSafeProxyInstance.address
      );
    });
    it("succeeds", async () => {
      await hyperDaoInstance.assembleDao(CHANNEL_ID, ownersArray, threshold);

      safeAddress = await hyperDaoInstance.chatToHyperDao(CHANNEL_ID);

      const hyperGnosisSafe = await gnosisSafeContractFactory.attach(
        safeAddress
      );

      expect(await hyperGnosisSafe.isOwner(owner1.address));
      expect(await hyperGnosisSafe.isOwner(owner2.address));
      expect(await hyperGnosisSafe.isOwner(owner3.address));
    });
  });
});
