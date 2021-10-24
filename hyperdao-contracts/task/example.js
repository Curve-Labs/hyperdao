const { api } = require("./gnosis");

const safeAddress = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
const safeTxHash =
  "0x69e35a1b8e0ff37ca70461ca7caff47038bf1defbf601f2a65cb8ecf98367a85";
const networkName = "rinkeby";

const { addConfirmation, getTransaction } = api(safeAddress, networkName);

getTransaction(safeTxHash)
  .then((result) => {
    const { data } = result;

    // TODO: HERE WE WOULD SIGN EITHER data.safeTxHash or data.transactionHash
    const signature = "0x69e35a1b8e0ff37ca70461ca7caff4";

    const payload = {
      signature,
    };

    return addConfirmation(payload, safeTxHash);
  })
  .then((r) => console.log(r))
  .catch((e) => console.log(e));
