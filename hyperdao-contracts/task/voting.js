const { api } = require("./gnosis");

const safeAddress = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
const safeTxHash =
  "0x69e35a1b8e0ff37ca70461ca7caff47038bf1defbf601f2a65cb8ecf98367a85";
const networkName = "rinkeby";

const { addConfirmation, getTransaction } = api(safeAddress, networkName);

task("doIt", "do some stuff").setAction(async (_, { ethers }) => {
  const { root } = await ethers.getNamedSigners();
  getTransaction(safeTxHash)
    .then((result) => {
      const {
        data: { transactionHash },
      } = result;

      // HERE WE WOULD SIGN THE TRANSACTION
      const hash = "0x69e35a1b8e0ff37ca70461ca7caff4";

      const payload = {
        signature: hash,
      };

      return addConfirmation(payload, safeTxHash);
    })
    .then((r) => console.log(r))
    .catch((e) => console.log(e));
});

getTransaction(safeTxHash)
  .then((result) => {
    const {
      data: { transactionHash },
    } = result;

    // HERE WE WOULD SIGN THE TRANSACTION
    const hash = "0x69e35a1b8e0ff37ca70461ca7caff4";

    const payload = {
      signature: hash,
    };

    return addConfirmation(payload, safeTxHash);
  })
  .then((r) => console.log(r))
  .catch((e) => console.log(e));
