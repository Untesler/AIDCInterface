const fs               = require('fs-extra'),
      path             = require('path'),
      { MessageEmbed } = require('discord.js')

const { master, version, updateDetail } = fs.readJsonSync(path.join(__dirname, '../config.json'))

module.exports = (client, msg) => {
    const embed = new MessageEmbed();
    embed.setTitle(`:clipboard: รายการอัพเดทเวอร์ชั่น ${version}`)
    .setDescription(`นี่เป็นรายละเอียดการอัพเดทของ ${client.user.username} เวอร์ชั่น ${version} ค่ะนายท่าน`)
    .setThumbnail('https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_12.png')
    .setFooter(`${client.user.username} Vers.${version}`, 'https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_6.png')
    .addField('รายละเอียด', `${updateDetail}`, false)
    .setTimestamp()
    return msg.reply(embed)
}