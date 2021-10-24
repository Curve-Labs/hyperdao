from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
from handler import base, keyboardHandler

# Telegram bot initialization
updater = Updater(token='2074362788:AAGE3IBmJiRWQCSrWWb0VibCaz_boYLif40', use_context=True)
dispatcher = updater.dispatcher

#  Initial message sendere
start_handler = CommandHandler('start', base.start)
dispatcher.add_handler(start_handler)

cancel_handler = CommandHandler('cancel', base.cancel)
dispatcher.add_handler(cancel_handler)

unknown_handler = MessageHandler(Filters.command, base.unknown)
dispatcher.add_handler(unknown_handler)

message_handler = MessageHandler(Filters.text, keyboardHandler.keyboard_handler)
dispatcher.add_handler(message_handler)

updater.start_polling()
updater.idle()
