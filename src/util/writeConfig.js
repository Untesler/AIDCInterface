const fs             = require('fs-extra'),
      path           = require('path')

module.exports = config => {
    const wConfig = {
        token:{
            bot : "",
            core: ""
        },
        coreApi:[
            {
                method: "",
                url   : ""
            }
        ],
        id:{
            bot         : "",
            voiceChannel: [],
            textChanId  : []
        },
        presence:[],
        master:[],
        presenceInterval: 20,
        commandPrefix   : "bot",
        version         : "1.0.0",
        updateDetail    : "UPDATE_DETAIL",
        ...config
    }
    try {
        fs.writeJsonSync(path.join(__dirname, '../config.json'), wConfig)
        return true
    } catch (error) {
        console.error(`Error occurs: ${error.message}`)
        return false
    }
}
