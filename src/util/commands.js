const fs           = require('fs'),
      path         = require('path'),
      commandsList = fs.readdirSync(path.join(__dirname, '../commands')).map(e => e.replace('.js', ''))

async function execCommand(client, msg, cmd) {
    const command = require(`../commands/${cmd}`)
    await command(client, msg)
}
exports.run = async (client, msg, cmd) => {
    const searchSpace = cmd.search(' ')
    let command =
      searchSpace === -1
        ? cmd.toLowerCase().replace(/-|_/g, "")
        : cmd
            .toLowerCase()
            .replace(/-|_/g, "")
            .slice(0, searchSpace);
    if (!commandsList.includes(command)) {
        return msg.reply(`ขอโทษค่ะนายท่าน จากการตรวจสอบไม่พบคำสั่ง ${cmd} ค่ะ`)
    }
    return execCommand(client, msg, command)
}