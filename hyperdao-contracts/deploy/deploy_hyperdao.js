const deployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const [root] = await ethers.getSigners();

  const safeAddress = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
  const gnosisSafeProxyFactoryAddress =
    "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";

  await deploy("HyperDAO", {
    from: root.address,
    args: [safeAddress, gnosisSafeProxyFactoryAddress],
    log: true,
  });
};

module.exports = deployFunction;
