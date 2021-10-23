pragma solidity 0.8.9;

import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol";

interface IGnosisSafeProxyFactory {
  function createProxyWithNonce(
    address _singleton,
    bytes memory initializer,
    uint256 saltNonce
  ) external returns (GnosisSafeProxy proxy);
}
