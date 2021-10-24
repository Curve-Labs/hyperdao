const WalletConnect = require("@walletconnect/client").default;
const WalletConnectProvider = require("@walletconnect/web3-provider").default;
const NodeWalletConnect = require("@walletconnect/node").default;
const WalletConnectQRCodeModal = require("@walletconnect/qrcode-modal");

console.log(WalletConnectQRCodeModal);
const provider = new WalletConnectProvider({
  infuraId: "4c9049736af84c46ad0972910df0476a",
  qrcode: false,
});

provider.connector.on("display_uri", (err, payload) => {
  console.log(payload);
  const uri = payload.params[0];
  console.log(uri);
  CustomQRCodeModal.display(uri)
});


const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
});


const walletConnector = new NodeWalletConnect(
  {
    bridge: "https://bridge.walletconnect.org", // Required
  },
  {
    clientMeta: {
      description: "WalletConnect NodeJS Client",
      url: "https://nodejs.org/en/",
      icons: ["https://nodejs.org/static/images/logo.svg"],
      name: "WalletConnect",
    },
  }
);

// Check if connection is already established
if (!walletConnector.connected) {
  // create new session
  walletConnector.createSession().then(() => {
    // get uri for QR Code modal
    const uri = walletConnector.uri;
    // display QR Code modal
    WalletConnectQRCodeModal.open(
      uri,
      () => {
        console.log("QR Code Modal closed");
      },
      true // isNode = true
    );
  });
}