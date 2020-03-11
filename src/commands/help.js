const { MessageEmbed } = require('discord.js'),
      fs               = require('fs-extra'),
      path             = require('path')

// TODO : Add Dev commands
module.exports = async (client, msg) => {
    const commandsList = fs.readJsonSync(path.join(__dirname, '../commands.json')),
          botInfo      = fs.readJsonSync(path.join(__dirname, '../config.json')),
          embed        = new MessageEmbed(),
          callerId     = msg.author.id, // for check Dev user
          callCmd      = msg.content.split(' ')[2] ? msg.content.split(' ')[2] : false;
    let   found        = false;
    
    if (callCmd) {
        embed.setTitle(`:bookmark_tabs: รายละเอียดคำสั่ง ${callCmd}`)
        .setImage('https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_12.png')
        .setDescription(`รายละเอียดของคำสั่ง ${callCmd} แสดงดังรายการข้างล่างค่ะ\nโดยเครื่องหมาย [...] หมายความว่านายท่านสามารถเลือกที่จะส่งหรือไม่ส่งข้อมูลข้างใน [...] ไปก็ได้`)
    } else {
        embed.setTitle(':bookmark: รายการคำสั่ง')
        .setImage('https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aicmdslist.png')
        .setDescription(`รายการคำสั่งทั้งหมดแสดงดังรายการด้านล่างค่ะ \nสำหรับรายละเอียดเพิ่มเติมของแต่ละคำสั่งหากนายท่านต้องการทราบให้ทำการพิมพ์\n\`${botInfo.commandPrefix} help <ชื่อคำสั่ง>\``)
    }
    embed.setTimestamp()
    .setFooter(`${client.user.username} Vers.${botInfo.version}`, 'https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_6.png')
    for (const group in commandsList.OrdinaryUser) {
        // Group name = group
        const examples = []
        for (const cmd in commandsList.OrdinaryUser[group]) {
            // Command name = cmd
            const cmdObj = commandsList.OrdinaryUser[group][cmd] // Detail in each command
            if (callCmd) {
                if (cmd !== callCmd) continue
                else {
                    found = true;
                    embed.addField(`กลุ่ม ${group}`, cmd, true)
                    embed.addField(`การใช้งาน`, `\`${botInfo.commandPrefix} ${cmdObj.example}\``, true)
                    embed.addField(`รายละเอียด`, `${cmdObj.description}`, false)
                }
            } else {
                examples.push(cmdObj.example)
            }
        }
        if (!callCmd) {
            embed.addField(`กลุ่ม ${group}`, 
            Object.keys(commandsList.OrdinaryUser[group]).reduce((acc, curr) => acc+'\n'+curr)
            , true)
            embed.addField(`|`,
            examples.reduce((acc => {if(!acc.includes('|')) acc = '|'; return acc+`\n|`}), '').slice(0, -1)
            , true) // Add barrier(|) between each field
            embed.addField(`การใช้งาน`,
            examples.reduce(((acc, curr) => acc+`\`${botInfo.commandPrefix} ${curr}\`\n`), '')
            , true)
        }
    }
    if (!found && callCmd) {
        embed.setDescription(`ไม่พบคำสั่งที่นายท่านร้องขอในรายการคำสั่งของ ${client.user.username} ค่ะ`)
        embed.setTitle(`:x: ไม่พบคำสั่ง ${callCmd}`)
        embed.setImage('https://raw.githubusercontent.com/Untesler/AIDCInterface/master/assets/img/aiexp_8.png')
    }
    msg.reply(embed)
}