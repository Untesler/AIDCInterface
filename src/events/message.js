const handler = async message => {
    if (message.content.toLowerCase() === 'ping') message.reply('Pong!!')
}

module.exports = handler