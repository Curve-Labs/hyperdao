pragma solidity 0.8.9;

import "./interface/ISafe.sol";
import "@gnosis.pm/safe-contracts/contracts/interfaces/ISignatureValidator.sol";
import "./interface/IGnosisSafeProxyFactory.sol";

contract HyperDAO is ISignatureValidator {
  address safeMasterCopy;
  address proxyFactoryMasterCopy;

  bytes32 private constant DOMAIN_SEPARATOR_TYPEHASH =
    0x7a9f5b2bf4dbb53eb85e012c6094a3d71d76e5bfe821f44ab63ed59311264e35;
  bytes32 private constant MSG_TYPEHASH =
    0xa1a7ad659422d5fc08fdc481fd7d8af8daf7993bc4e833452b0268ceaab66e5d; // mapping for msg typehash

  mapping(int256 => address) public chatToHyperDao;
  mapping(bytes32 => bytes32) public approvedSignatures;

  event SignatureCreated(bytes signature, bytes32 indexed hash);
  event HyperDaoAssembled(int256 indexed chatID, address indexed safe);

  /**
   * @dev HyperDAO constructor function.
   */
  constructor(address _safeMasterCopy, address _proxyFactoryMasterCopy) {
    safeMasterCopy = _safeMasterCopy;
    proxyFactoryMasterCopy = _proxyFactoryMasterCopy;
  }

  function assembleDao(
    int256 chatID,
    address[] memory _owners,
    uint256 _threshold
  ) public {
    // create safe through proxy
    address chat = _createNewSafe(_owners, _threshold, uint256(chatID));
    chatToHyperDao[chatID] = chat;

    emit HyperDaoAssembled(chatID, chat);
  }

  // This function need to be implemented in the function above
  // minimal, to add new owners at the time of creating a new Gnosis Safe
  function _createNewSafe(
    address[] memory _owners,
    uint256 _threshold,
    uint256 nonce
  ) internal returns (address) {
    bytes memory initializer = abi.encodeWithSignature(
      "setup(address[],uint256,address,bytes,address,address,uint256,address)",
      _owners,
      _threshold,
      address(0),
      "0x",
      address(0),
      address(0),
      0,
      address(0)
    );
    return
      address(
        IGnosisSafeProxyFactory(proxyFactoryMasterCopy).createProxyWithNonce(
          safeMasterCopy,
          initializer,
          nonce
        )
      );
  }

  /**
   * @dev                   Signature generator
   * @param _to             receiver address.
   * @param _value          value in wei.
   * @param _data           encoded transaction data.
   * @param _operation      type of operation call.
   * @param _safeTxGas      safe transaction gas for gnosis safe.
   * @param _baseGas        base gas for gnosis safe.
   * @param _gasPrice       gas price for gnosis safe transaction.
   * @param _nonce          gnosis safe contract nonce.
   */
  function generateSignature(
    int256 _chatID,
    address _to,
    uint256 _value,
    bytes calldata _data,
    Enum.Operation _operation,
    uint256 _safeTxGas,
    uint256 _baseGas,
    uint256 _gasPrice,
    uint256 _nonce
  ) external returns (bytes memory signature, bytes32 hash) {
    // check if transaction parameters are correct
    address currentSafe = chatToHyperDao[_chatID];

    // get contractTransactionHash from gnosis safe
    hash = Safe(currentSafe).getTransactionHash(
      _to,
      0,
      _data,
      _operation,
      _safeTxGas,
      _baseGas,
      _gasPrice,
      address(0),
      address(0),
      _nonce
    );

    bytes memory paddedAddress = bytes.concat(
      bytes12(0),
      bytes20(address(this))
    );
    bytes memory messageHash = _encodeMessageHash(hash);
    // check if transaction is not signed before
    require(
      approvedSignatures[hash] != keccak256(messageHash),
      "Signer: transaction already signed"
    );

    // generate signature and add it to approvedSignatures mapping
    signature = bytes.concat(
      paddedAddress,
      bytes32(uint256(65)),
      bytes1(0),
      bytes32(uint256(messageHash.length)),
      messageHash
    );
    approvedSignatures[hash] = keccak256(messageHash);
    emit SignatureCreated(signature, hash);
  }

  /**
   * @dev                Validate signature using EIP1271
   * @param _data        Encoded transaction hash supplied to verify signature.
   * @param _signature   Signature that needs to be verified.
   */
  function isValidSignature(bytes memory _data, bytes memory _signature)
    public
    view
    override
    returns (bytes4)
  {
    if (_data.length == 32) {
      bytes32 hash;
      assembly {
        hash := mload(add(_data, 32))
      }
      if (approvedSignatures[hash] == keccak256(_signature)) {
        return EIP1271_MAGIC_VALUE;
      }
    } else {
      if (approvedSignatures[keccak256(_data)] == keccak256(_signature)) {
        return EIP1271_MAGIC_VALUE;
      }
    }
    return "0x";
  }

  /**
   * @dev               Get the byte hash of function call i.e. first four bytes of data
   * @param data        encoded transaction data.
   */
  function _getFunctionHashFromData(bytes memory data)
    private
    pure
    returns (bytes4 functionHash)
  {
    assembly {
      functionHash := mload(add(data, 32))
    }
  }

  /**
   * @dev                encode message with contants
   * @param message      the message that needs to be encoded
   */
  function _encodeMessageHash(bytes32 message)
    private
    pure
    returns (bytes memory)
  {
    bytes32 safeMessageHash = keccak256(abi.encode(MSG_TYPEHASH, message));
    return
      abi.encodePacked(
        bytes1(0x19),
        bytes1(0x23),
        keccak256(abi.encode(DOMAIN_SEPARATOR_TYPEHASH, safeMessageHash))
      );
  }

  /**
   * @dev                set new safe
   * @param _safe        safe address
   */
  function setSafe(address _safe, int256 _chatID) public {
    require(
      msg.sender == chatToHyperDao[_chatID],
      "Signer: only safe functionality"
    );
    require(_safe != address(0), "Signer: new safe cannot be zero address");
    chatToHyperDao[_chatID] = _safe;
  }
}
