
from telegram import ReplyKeyboardMarkup
from urllib.parse import quote

from handler.base import start

baseUrl = 'https://nostalgic-keller-a5c94b.netlify.app/'


def initialize(update, context, chatId, chatTitle):
    reply_keyboard = [['Add proposal','Vote for proposal']]
    update.message.reply_text(
        baseUrl + 'createDao?chatId=' + str(chatId) + '&chatTitle=' + quote(chatTitle),
        reply_markup=ReplyKeyboardMarkup(reply_keyboard, resize_keyboard=True, one_time_keyboard=True)
    )
    # start(update, context)

