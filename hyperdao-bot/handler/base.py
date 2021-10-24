from telegram import ReplyKeyboardMarkup
from handler.reserve import userState


reply_keyboard = [['Add proposal','Vote for proposal']]
start_keyboard = [['hyper']]

def start(update, context):
    # userState[update.message.chat.id]['state'] = {}
    # userState[update.message.chat.id]['state'] = 'initial'
    if isInitialized(update):
        update.message.reply_text(
            'Welcome to DAO telegram bot.\n'
            'You can propose transactions, vote for proposals and manage your DAO!\n\n'
            'Main features of bot:\n'
            '- add proposal;\n'
            '- vote for/against proposal;\n'        
            'Send /cancel if you want to return to the main menu(just in case)',
            reply_markup=ReplyKeyboardMarkup(reply_keyboard, resize_keyboard=True))
    else:
        update.message.reply_text(
            'you want to create a new DAO?'
            'To do so, go into the DAO chat group and type /hyper',
            reply_markup=ReplyKeyboardMarkup(start_keyboard, resize_keyboard=True))


def cancel(update, context):
    userState[update.message.chat.id]['state'] = 'initial'
    update.message.reply_text(
        'Back to the main menu we go...',
        reply_markup=ReplyKeyboardMarkup(reply_keyboard if isInitialized(update) else start_keyboard, resize_keyboard=True))


def unknown(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Hey man, stop right there, this shit isn't ready yet🖕")

def isInitialized(update):
    return userState and userState['usersGroups'] and userState['usersGroups'][update.message.chat.username]