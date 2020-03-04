const fs            = require('fs'),
      path          = require('path'),
      eventHandlers = []

const startEventManagers = bot => {
    const files = fs.readdirSync(path.join(__dirname, '../events'))
    for (const file of files) {
        const event   = file.replace('.js', '')
        const handler = require(`../events/${event}`)
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