const { MessageEmbed } = require('discord.js');

module.exports = async (client, msg) =>{
    try {
        const map    = client.voice.connections.values().next().value,
              player = map.dispatcher || false;
        if (msg.member.voice.channel.id !== map.channel.id) {
            return msg.reply(`ขอโทษค่ะ แต่นายท่านไม่ได้อยู่ใน Channel เดียวกันกับ ${client.user.username} นะคะ :thinking:`)
        }
        if(!player) {
            return msg.reply(`ขอโทษด้วยค่ะ แต่จากการตรวจสอบแล้ว ${client.user.username} ไม่พบการเล่นไฟล์ที่ค้างอยู่นะคะ`)
        } else {
            if (!player.paused) {
                const msgEmbed = map.musicsQueue.embed,
                      embed    = new MessageEmbed(map.musicsQueue.embed.embeds[0])
                embed.setTitle(":pause_button: พักการเล่นไฟล์เสียงค่ะ");
                await msgEmbed.edit(embed)
                player.pause()
            }
        }
    } catch (error) {
        if (error instanceof TypeError) {
            return msg.reply(`ขอโทษด้วยค่ะ แต่จากการตรวจสอบแล้ว ${client.user.username} ไม่พบการเล่นไฟล์ที่ค้างอยู่นะคะ`)
        }
        console.error(`Error occurs: ${error.message}`);
        msg.reply(
            "ขอด้วยค่ะ เนื่องจากข้อผิดพลาดของระบบจึงทำให้ไม่สามารถปฏิบัติตามคำร้องขอได้ค่ะ :sob:"
        );
    } 
}