module.exports = async (client, msg) => {
    if (msg.member.voice.channel) {
        try {
            const connection = await msg.member.voice.channel.join()
            msg.reply('Connected!')
        } catch (error) {
            console.error(error.message)
        }
    } else {
        return msg.reply('You need to join a voice channel first!')
    }
}