const Discord    = require('discord.js'),
      fs         = require('fs-extra'),
      path       = require('path'),
      client     = new Discord.Client(),
      configPath = path.join(__dirname, 'config/config_core.json')

async function run(config) {
    try {
        client.login(config.token.bot)
        client.on('ready', () => {
            console.info(`# - Ready to run Bot ID : ${config.id.bot}`)
            let flipVal = 0;
            const setPresVal = config.presence
            /* Set bot presense every 10 sec */
            setInterval(() => {
                client.user.setPresence({ game:
                    {
                        name: setPresVal[flipVal],
                        type: setPresVal[flipVal + 2]
                    }
                });
                flipVal = (flipVal === 0) ? 1 : 0;
            }, 10000);
        })
        client.on('message', message => {
            if(message.content === 'ping') {
                message.reply(client.pings)
            }
        })
    } catch (error) {
        console.error(`Error : ${error.message}`)
    }
}

async function init () {
  let config; //eslint-disable-line
  try{
    config = await fs.readJsonSync(configPath);
    for(const member in config) {
      const toObj = JSON.parse(JSON.stringify(config[member]));
      for(const idValue in toObj){
        if(toObj[idValue] === ''){
          console.info('Pls, fill full the config file.');
          return;
        }
      }
    }
    console.log('# - Config file reading complete')
    return run(config);
  }catch(err){
    if(err.message.includes('no such file or directory')){
      config = {
        token: {
            bot: '',
            core: ''
        },
        coreApi: {
            text: ''
        },
        id: {
            bot: '',
            voiceChanId:[]
        },
        presence:[],
        commandPrefix:'',
        version:'',
        updateDetail:''
      }
      fs.writeJsonSync(configPath, config);
      console.info('! - You need to setting this config file at ' + configPath);
    }
    else if (err.message.includes('Unexpected end of JSON input')) console.error('! - config file is empty');
    else console.error(err);
    return;
  }
}

init()