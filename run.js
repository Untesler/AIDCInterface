const fs         = require('fs-extra'),
      path       = require('path'),
      Interface  = require('./src/index')
      configPath = path.join(__dirname, 'config/config.json')

async function run(config) {
  const client = new Interface.Client(config)
  client.login()
}

async function init () {
  let config; //eslint-disable-line
  try{
    config = await fs.readJsonSync(configPath)
    console.log('Config file reading complete')
    return run(config)
  }catch(err){
    if(err.message.includes('no such file or directory')){
      config = {
        token:{
            bot : "YOUR_BOT_TOKEN",
            core: "AICORE_TOKEN"
        },
        coreApi:[
            {
                method: "REQUEST_METHOD",
                url   : "REQUEST_URL"
            }
        ],
        id:{
            bot         : "BOT_ID",
            voiceChannel: ["VOICE_CHANNEL_ID"],
            textChanId  : ["TEXT_CHANNEL_ID"]
        },
        presence:[
            { "name": "PRESENCE_NAME", "type": "PRESENCE_TYPE"}
        ],
        master          : ["BOT_OWNER_ID"],
        presenceInterval: 20,
        commandPrefix   : "BOT_PREFIX",
        version         : "BOT_VERSION",
        updateDetail    : "UPDATE_DETAIL"
      }
      const createdPath = path.join(__dirname, 'config/config.json')
      fs.writeJsonSync(createdPath, config)
      console.info(`You need to setting this config file at ${createdPath} `)
    }
    else if (err.message.includes('Unexpected end of JSON input')) console.error('Config file is empty')
    else console.error(err)
    return;
  }
}

init()