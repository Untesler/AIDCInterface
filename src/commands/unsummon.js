module.exports = async (client, msg) => {
    try {
        const map = client.voice.connections
        const iterator = map.values()
        const connection = (iterator.next().value).channel
        await connection.leave()
        msg.reply('Disconnected!')
    } catch (error) {
        if (error instanceof TypeError) {
            return msg.reply('The Bot not in voice channel.')
        } else {
            console.error(`Error occurs: ${error.message}`)
        }
    }
}