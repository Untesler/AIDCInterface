const fs           = require('fs'),
      path         = require('path')

async function record(map, user, options = {}) {
    const recorder      = map.player.voiceConnection.receiver,
          player        = map.dispatcher || map.player.voiceConnection,
          audioStream   = recorder.createStream(user, { mode: 'pcm', end: 'silence' }),
          fileName      = `${Date.now()}.wav`,
          filePath      = path.join(__dirname, `../../assets/sound/${fileName}`),
          numChannels   = options.numChannels || 2,
          sampleRate    = options.sampleRate || 48000,
          bitsPerSample = options.bitsPerSample || 16,
          header        = Buffer.alloc(44);
    let   pcmBuffer     = Buffer.alloc(0);

    return new Promise(async (resolve, reject) => {
        // For unknown reason we need to play some audio data before recieve any incoming audio data.
        // Maybe because prevent recording when the bot playing some audio data.
        if (map.dispatcher) {
            const msgEmbed = map.musicsQueue.embed,
                  embed    = new (require('discord.js').MessageEmbed)(map.musicsQueue.embed.embeds[0]);
            embed.setTitle(":pause_button: พักการเล่นไฟล์เสียงค่ะ");
            await msgEmbed.edit(embed)
            player.pause();
        }
        else player.play(path.join(__dirname, '../../assets/sound/empty.mp3'));
        audioStream.on('data', chunk => {
            // Recording...
            pcmBuffer = Buffer.concat([pcmBuffer, chunk], pcmBuffer.length + chunk.length)
        });
        //audioStream.pipe(fs.createWriteStream(filePath))
        audioStream.on('end', () => {
            console.info("End stream")
            // Add header to raw buffer to encode pcm to wav file
            // WAVE RIFF header
            header.write('RIFF', 0) // chunk id
            header.writeUInt32LE(pcmBuffer.length, 4) // chunk size
            header.write('WAVE', 8) // format
            // SUB CHUNK 1 (FORMAT)
            header.write('fmt ', 12) // subchunk 1 id
            header.writeUInt8(16, 16) // subchunk 1 size
            header.writeUInt8(1, 20) // audio format (1 = PCM)
            header.writeUInt8(numChannels, 22) // number of channel
            header.writeUInt32LE(sampleRate, 24) // sample rate
            header.writeUInt32LE(sampleRate*numChannels*bitsPerSample/8, 28) // byte rate
            header.writeUInt8(numChannels*bitsPerSample/8, 32) // block align
            header.writeUInt8(bitsPerSample, 34) // bits per sample (16 for PCM16)
            // SUB CHUNK 2 (AUDIO DATA)
            header.write('data', 36) // subchunk 2 id
            header.writeUInt32LE(pcmBuffer.length + 44 - 8, 40) // subchunk 2 size
            const wavData = Buffer.concat([header, pcmBuffer], header.length + pcmBuffer.length)
            try { fs.writeFileSync(filePath, wavData )} catch (err) { console.error(`Error occur while write wav file : ${err.message}`) ; reject(false)}
            resolve(true)
        });
        audioStream.on('error', err => {
            console.error(`Error occur while record: ${err.message}`)
            reject(false)
        })
    })
}

// Return a User object if can find the given userId in the channel that bot exists
async function verifyId(client, map, userId) {
    const voiceStates    = map.channel.guild.voiceStates.cache,
          currentChannel = map.channel.id;
          botId = (require('fs-extra').readJsonSync(path.join(__dirname, '../config.json'))).id.bot
    let searchResult = undefined;
    if (!(userId.length === 18 && !isNaN(Number.parseInt(userId)))) return -1;
    if (userId === botId) return -2;
    voiceStates.forEach((value, key, map) => {
        if (value.id === userId) {
            return searchResult = value
        }
    });
    if (searchResult) {
        if (searchResult.channelID === currentChannel)
            return await client.users.fetch(userId) // fetch User object
        else return 0; // bot not in channel of userId
    } else return -1; // can't find userId
}

module.exports = async (client, msg) => {
    const botName = client.user.username;
    try {
        const map     = client.voice.connections.values().next().value,
              botName = client.user.username,
              User    = msg.content.split(' ')[2] ?
                        await verifyId(client, map, msg.content.split(' ')[2]): 
                        msg.author;
        switch (User) {
            case 0:
                return msg.reply(`ขอโทษค่ะ แต่จากการตรวจสอบแล้ว ${botName} ไม่พบว่า ID ที่ร้องขอการบันทึกอยู่ใน Channel เดียวกันกับ ${botName} นะคะ`)
            case -1:
                return msg.reply(`ขอโทษค่ะ แต่จากการตรวจสอบแล้ว ${botName} ไม่พบว่ามี ID ที่ร้องขอนะคะ`)
            case -2:
                return msg.reply(`ขอโทษค่ะ แต่นายท่านไม่สามารถบันทึกเสียงของ ${botName} ได้นะคะ`)
        }
        if (msg.member.voice.channel.id !== map.channel.id || [0, -1, -2].indexOf(User) !== -1) {
            return msg.reply(
                `ขอโทษค่ะ แต่นายท่านไม่ได้อยู่ใน Channel เดียวกันกับ ${botName} นะคะ :thinking:`
            );
        }
        let countdown = 3,
            timeout   = countdown+1,
            recMsg    = await msg.reply(`จะเริ่มทำการบันทึกเสียงใน ${countdown}`),
            interval  = setInterval(() => {recMsg.edit(`จะเริ่มทำการบันทึกเสียงใน ${countdown}`);--countdown}, 1000);
        setTimeout(async () => {
            clearInterval(interval)
            await recMsg.edit('กำลังบันทึกเสียง')
            const success = await record(map, User)
            if (success)
                return recMsg.edit('เสร็จสิ้นการบันทึกเสียง')
            else 
                return recMsg.edit('การบันทึกเสียงล้มเหลว')
        }, timeout*1000)
    } catch (error) {
        console.error(`Error occur at recorder : ${error.message}`)
        if (error instanceof TypeError) {
            return msg.reply(
                `ตอนนี้ ${botName} ไม่ได้อยู่ใน Channel ไหนเลยค่ะ :disappointed_relieved:`
            );
        }
    }
}