const fs   = require('fs-extra'),
      path = require('path')

const { master, version, updateDetail } = fs.readJsonSync(path.join(__dirname, '../config.json'))

module.exports = (client, msg) => {
    return msg.reply(`นี่เป็นรายการอัพเดทของเวอร์ชั่น ${version} ค่ะนายท่าน\n${updateDetail}`)
}