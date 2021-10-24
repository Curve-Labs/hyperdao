```
                     _                              _             
                    | |                            | |            
                    | |__  _   _ _ __   ___ _ __ __| | __ _  ___  
                    | '_ \| | | | '_ \ / _ \ '__/ _` |/ _` |/ _ \ 
                    | | | | |_| | |_) |  __/ | | (_| | (_| | (_) |
                    |_| |_|\__, | .__/ \___|_|  \__,_|\__,_|\___/ 
                            __/ | |                               
                           |___/|_|                               
```
# hyperdao eth lisbon project


Hyperdao is a next generation collaboration tool for Decentralized Autonomous Organisation. Hyperdao helps to turn Telegram groups into fully functioning DAOs and enables DAO participant to add new members, manage treasury and interact with Ethereum smart contracts within a shared Telegram group. 

As a part of PoC Hyperdao uses Gnosis Safe as a miniminal viable DAO and allows Multisig owners to sign and execute transactions, however any member of the Telegram group is allowed to create proposals to the DAO.

Authorisation level happens through wallet connect what allows hyperdaos to function in a trustless way.

This is a monorepo and it's organized as follows:

- `hyperdao-contracts` smart contracts responsible for the Gnosis Safe deployment and interaction
- `hyperdao-dapp` front-end for the hyperdao creation
