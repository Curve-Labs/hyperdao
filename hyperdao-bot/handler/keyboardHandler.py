from web3 import Web3

from handler.base import cancel, unknown
from handler.proposal import proposal
from handler.vote import vote
from handler.initialize import initialize
from handler.reserve import userState
import requests
import json

hyper_ABI = [{"inputs":[{"internalType":"address","name":"_safeMasterCopy","type":"address"},{"internalType":"address","name":"_proxyFactoryMasterCopy","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":"false","inputs":[{"indexed":"true","internalType":"int256","name":"chatID","type":"int256"},{"indexed":"true","internalType":"address","name":"safe","type":"address"}],"name":"HyperDaoAssembled","type":"event"},{"anonymous":"false","inputs":[{"indexed":"false","internalType":"bytes","name":"signature","type":"bytes"},{"indexed":"true","internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"SignatureCreated","type":"event"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"approvedSignatures","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"_chatID","type":"int256"},{"internalType":"address[]","name":"_owners","type":"address[]"},{"internalType":"uint256","name":"_threshold","type":"uint256"}],"name":"assembleDao","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"","type":"int256"}],"name":"chatToHyperDao","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"_chatID","type":"int256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"_operation","type":"uint8"},{"internalType":"uint256","name":"_safeTxGas","type":"uint256"},{"internalType":"uint256","name":"_baseGas","type":"uint256"},{"internalType":"uint256","name":"_gasPrice","type":"uint256"},{"internalType":"uint256","name":"_nonce","type":"uint256"}],"name":"generateSignature","outputs":[{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"bytes32","name":"hash","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_data","type":"bytes"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"isValidSignature","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_safe","type":"address"},{"internalType":"int256","name":"_chatID","type":"int256"}],"name":"setSafe","outputs":[],"stateMutability":"nonpayable","type":"function"}]
hyper_address = '0x36aebabB3fD32589425B1c0170EFfB55C7982575'

w3 = Web3(Web3.HTTPProvider('https://rinkeby.infura.io/v3/4c9049736af84c46ad0972910df0476a'))
hyper = w3.eth.contract(abi=hyper_ABI, address = hyper_address)


def keyboard_handler(update, context):
    if update.message.chat.id in userState and 'state' in userState[update.message.chat.id]:
        if userState[update.message.chat.id]['state'] == 'proposal':
            if update.message.text == 'Transfer Ethereum':
                update.message.reply_text(
                    'Enter address to which you want to transfer and amount of transfer in this format:')
                update.message.reply_text('address | amount')
                userState[update.message.chat.id]['state'] = 'transfer'
                return
            elif update.message.text == 'Cancel':
                cancel(update, context)
                return
        if userState[update.message.chat.id]['state'] == 'transfer':
            parameters = update.message.text.replace(" ", "").split("|")
            address = parameters[0]
            amount = parameters[1]

            if len(parameters) != 2 and (len(address) == 40 or len(address) == 42) :
                update.message.reply_text('Wrong message formatting')
                return
            update.message.reply_text( "https://nostalgic-keller-a5c94b.netlify.app/transfer?chatId=" + str(update.message.chat.id) + "&to=" + address + "&amount=" + amount)
            cancel(update, context)
            return

        if userState[update.message.chat.id]['state'] == 'vote':
            tx_hash = update.message.text
            update.message.reply_text("https://nostalgic-keller-a5c94b.netlify.app/vote?chatId=" + str(
                update.message.chat.id) + "&proposalId=" + tx_hash)
            cancel(update, context)
            return

    print(update.message.text[2:])
    if update.message.text == 'Add proposal':
        proposal(update, context)
        userState[update.message.chat.id] = {}
        userState[update.message.chat.id]['state'] = 'proposal'
    elif update.message.text == 'Vote for proposal':
        # vote(update, context)
        gnosisSafe = hyper.functions.chatToHyperDao(update.message.chat.id).call()
        # gnosisSafe = "0x2E46E481d57477A0663a7Ec61E7eDc65F4cb7F5C"
        if gnosisSafe == "0x0000000000000000000000000000000000000000":
            update.message.reply_text("Dao is not registered to this address")
            return
        print(gnosisSafe)
        # ?executed=false
        r = requests.get(
            "https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/" + gnosisSafe + "/multisig-transactions?executed=false")
        data = json.loads(r.text)
        update.message.reply_text("Active proposal hashes:")
        msg = ""
        j = 0
        for i in data['results']:
            if j >= 50:
                break
            msg += i['safeTxHash'] + '\n'
            j += 1
        if len(msg) == 0 :
            msg = "There are no proposals to vote for"
            update.message.reply_text(msg)
            cancel(update, context)
        update.message.reply_text(msg)
        update.message.reply_text("Print a proposal hash for which you want to vote:")
        userState[update.message.chat.id] = {}
        userState[update.message.chat.id]['state'] = 'vote'
    elif update.message.text == 'hyper':
        chatId = update.message.chat.id
        chatTitle = update.message.chat.title
        # adds mapping of user <>   chatgroup so that if user makes proposal
        # we know where the transaction needs to be send (via the chat id)
        userState['usersGroups'] = {}
        userState['usersGroups'][update.message.chat.username] = chatId
        initialize(update , context, chatId, chatTitle)
    else:
        unknown(update, context)
