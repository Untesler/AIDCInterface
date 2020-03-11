const fs   = require('fs'),
      path = require('path')

module.exports = async (client, msg) => {
    try {
        const map    = client.voice.connections.values().next().value,
              player = map.dispatcher || map.player.voiceConnection

        if (msg.member.voice.channel.id !== map.channel.id) {
            return msg.reply(`ขอโทษค่ะ แต่นายท่านไม่ได้อยู่ใน Channel เดียวกันกับ ${client.user.username} นะคะ :thinking:`)
        } else {
            const recordPath   = path.join(__dirname, '../../assets/sound/'),
                  files        = fs.readdirSync(recordPath).map(f => f.replace('.wav', '')),
                  latestRecord = Math.max(...files.filter(f => !isNaN(Number.parseInt(f)) ));
            if (latestRecord === -Infinity) return msg.reply(`จากการตรวจสอบแล้วไม่พบ Record ล่าสุดค่ะ`)
            if (map.dispatcher) {
                const queue = map.musicsQueue
                player.end();
                map.musicsQueue = { embed: undefined, queue: [] };
                player.dispacher = await map.player.voiceConnection.play(path.join(recordPath, `${latestRecord}.wav`))
                map.musicsQueue = queue
                if (map.musicsQueue.queue[0])
                    player.dispacher.once("finish", () => (require('./play'))(client, 'bypass'))
            } else {
                player.play(path.join(recordPath, `${latestRecord}.wav`))
            }
        }
    } catch (error) {
        if (error instanceof TypeError) {
            console.error(error.message)
            return msg.reply(`ขอโทษด้วยค่ะนายท่าน แต่ตอนนี้ ${client.user.username} ไม่อยู่ในสถานะที่จะสามารถเล่นไฟล์เสียงได้ค่ะ`)
        }
        console.error(`Error occurs: ${error.message}`);
        msg.reply(
            "ขอด้วยค่ะ เนื่องจากข้อผิดพลาดของระบบจึงทำให้ไม่สามารถปฏิบัติตามคำร้องขอได้ค่ะ :sob:"
        );
    }
}