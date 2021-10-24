
from telegram import ReplyKeyboardMarkup

def proposal(update, context):
    reply_keyboard = [[' Transfer Ethereum', '⛔ Add owner', '⛔ Remove owner'], ['⛔ Custom transaction', '⛔ Contract call', 'Cancel']]

    update.message.reply_text(
        'Choose the proposal type you want to send.',
        reply_markup=ReplyKeyboardMarkup(reply_keyboard, resize_keyboard=True, one_time_keyboard=True))


def transfer_ether(update, context):
    update.message.reply_text('Enter the address to which you want to transfer and amount in wei.')
