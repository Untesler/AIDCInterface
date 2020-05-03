const fs       = require("fs-extra"),
      path     = require("path"),
      { MessageEmbed } = require('discord.js')

const guildMemberAddHandler = async client => {
  return async member => {
    const botInfo = fs.readJSONSync(path.join(__dirname, '../config.json'))
          embed   = new MessageEmbed(),
          guild   = client.guilds.cache.array()[0],
          channel = await client.channels.fetch(guild.systemChannelID),
          role    = await guild.roles.fetch(botInfo.id.defaultRole)

    embed.setTitle(`:partying_face: มีสมาชิกท่านใหม่เพิ่มเข้ามาค่ะ `)
    .setDescription(`${client.user.username} ขอต้นรับนายท่าน ${member.displayName} เข้าสู่ ${guild.name} ของมาสเตอร์ค่ะ`)
    .setThumbnail('https://img3.thaipng.com/dy/54aef11e9def59801d538b939ee39c30/L0KzQYm3UsEzN5V1iZH0aYP2gLBuTfJqeqVtfNNELYLscrP2jr1xaaN5kZ9sbHnzPbL5lL1jcaN5gNZqeT31ebPpjB50NWZmUKQBMna1RIftg8M0NmM1SKQBNUS5QYa4WMQ6PGU6SKQEMEixgLBu/kisspng-birthday-ribbon-party-clip-art-birthday-ribbons-5a8262f246fc33.2002654615184944502908.png')
    .setImage('https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_2.png')
    .addField('รายละเอียด', `ทำการแต่งตั้งนายท่าน ${member.displayName} เข้าสู่ชนชั้น ${role.name} เรียบร้อยแล้วค่ะ \nสามารถตรวจสอบคำสั่งการใช้งาน ${client.user.username} ได้ผ่านคำสั่ง \`${botInfo.commandPrefix} help\` ค่ะ`, false)
    .setTimestamp()
    try {
        await member.edit({roles: [role]})
        channel.send(embed)
    } catch (error) {
      console.error(`Error occur when try to handler guildMemberAdd event : ${error.message}`)
    }
    return
  };
};

module.exports = guildMemberAddHandler;
