
from telegram import ReplyKeyboardMarkup

def vote(update, context):
    reply_keyboard = [[' Transfer Ethereum', '📖 Add owner', ' Remove owner'], [' Custom transaction', '📖 Contract call']]

    update.message.reply_text(
        'Choose the month, you want to reserve.',
        reply_markup=ReplyKeyboardMarkup(reply_keyboard, resize_keyboard=True, one_time_keyboard=True))

