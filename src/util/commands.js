const fs           = require('fs-extra'),
      path         = require('path'),
      commandsList = fs.readdirSync(path.join(__dirname, '../commands')).map(e => e.replace('.js', ''))

async function execCommand(client, msg, cmd) {
    const command = require(`../commands/${cmd}`)
    await command(client, msg)
}
exports.run = (client, msg, cmd) => {
    const command = cmd.toLowerCase().replace(/-|_| /g, '')
    if (!commandsList.includes(command)) {
        return msg.reply(`ขอโทษค่ะนายท่าน จากการตรวจสอบไม่พบคำสั่ง ${cmd} ค่ะ`)
    }
    return execCommand(client, msg, command)
}