const fs            = require('fs'),
      path          = require('path'),
      eventHandlers = [],
      handlerWithBotEvents = ['message', 'guildMemberAdd']

const startEventManagers = async (bot) => {
    const files = fs.readdirSync(path.join(__dirname, '../events'))
    for (const file of files) {
        const event   = file.replace('.js', '')
        const handler = require(`../events/${event}`)
        if (handlerWithBotEvents.indexOf(event) !== -1) {
            const handlerWithBot = await handler(bot)
            eventHandlers.push({ name: event, handler: handlerWithBot })
            bot.on(event, handlerWithBot)
            continue
        }
        eventHandlers.push({ name: event, handler: handler })
        bot.on(event, handler)
    }
}

const stopEventManagers = bot => {
    for (const eventHandler of eventHandlers) {
        bot.removeListener(eventHandler.name, eventHandler.handler)
    }
}

module.exports = {
    startEventManagers,
    stopEventManagers
}