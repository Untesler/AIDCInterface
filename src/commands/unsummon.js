module.exports = async (client, msg) => {
    try {
        const map        = client.voice.connections.values().next().value,
              connection = map.player.voiceConnection
        await connection.disconnect()
        msg.reply('Disconnected!')
    } catch (error) {
        if (error instanceof TypeError) {
            return msg.reply('The Bot not in voice channel.')
        } else {
            console.error(`Error occurs: ${error.message}`)
        }
    }
}