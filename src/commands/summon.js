module.exports = async (client, msg) => {
    try {
        if (msg.member.voice.channel) {
            await msg.member.voice.channel.join()
            msg.channel.send(`${client.user.username} ปรากฎตัว!!`)
        } else {
            msg.reply('ก่อนจะสั่งงานคำสั่งนี้นายท่านกรุณาเข้าร่วม Voice Channel ด้วยค่ะ!!!')
        }
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('voice')) {
            msg.reply(`ขอโทษค่ะแต่การจะปฏิบัติตามคำสั่งนี้นายท่านจำเป็นต้องอยู่ในขอบเขตการดูแลของ ${client.user.username} นะคะ`)
        } else {
            console.error(`Error occurs: ${error.message}`)
            msg.reply('ขอด้วยค่ะ เนื่องจากข้อผิดพลาดของระบบจึงทำให้ไม่สามารถปฏิบัติตามคำร้องขอได้ค่ะ')
        }
    }
}