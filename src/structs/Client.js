const Discord          = require('discord.js'),
      { EventEmitter } = require('events'),
      listeners        = require('../util/listeners'),
      writeConfig      = require('../util/writeConfig')
const STATES           = {
    STOPPED : 'STOPPED',
    STARTING: 'STARTING',
    READY   : 'READY'
}
const CLIENT_OPTIONS = {}

class Client extends EventEmitter{
    constructor (config) {
        super()
        writeConfig(config)
        this.botToken         = config.token.bot
        this.id               = config.id
        this.presence         = config.presence
        this.commandPrefix    = config.commandPrefix
        this.version          = config.version
        this.updateDetail     = config.updateDetail
        this.presenceInterval = (config.presenceInterval+0 >= 0) ? config.presenceInterval : 10
        this.state            = STATES.STOPPED
    }
    
    async login () {
        if (this.bot) return console.info('Already logged in')
        if (typeof this.botToken !== 'string') throw new TypeError('Token must a string')
        const client = new Discord.Client(CLIENT_OPTIONS)
        try {
            await client.login(this.botToken)
            const presence = [
                { name: `${client.user.username} Vers.${this.version}`, type: 1 },
                { name: `${this.commandPrefix} help`, type: 0 },
                ...this.presence
            ]
            //Set presence, because client might be emit once after it logged in
            client.on('ready', () => {
                let index = 0
                //Start bot with message
                client.channels.fetch(this.id.textChanId[0])
                .then(channel => {
                    channel.send(`${client.user.username} Online!!!`)
                })
                // Set bot presense every this.presenceInterval sec
                setInterval(() => {
                    client.user.setPresence(
                        { 
                            activity: 
                            { 
                                name: presence[index].name, 
                                type: presence[index].type 
                            },
                            status: 'online'
                        })
                        index = (index === presence.length-1) ? 0 : ++index
                }, this.presenceInterval*1000)
            })
            this.bot = client
            if (!client.readyAt) {
                client.once('ready', this.init.bind(this))
            } else {
                this.init()
            }
        } catch (err) {
            console.error(`Error ${err.message} occurs, retrying in 5 minutes`)
            setTimeout(() => this.login.bind(this), 300000)
        }
    }

    init () {
        const bot = this.bot
        
        bot.on('error', err => {
            console.error(`Websocket error : ${err.message}`)
            this.stop()
        })
        bot.on('resume', () => {
            console.info('Websocket resumed')
            this.start()
        })
        bot.on('disconnect', () => {
            console.info('Websocket disconnected')
            this.stop()
        })
        /* active when clientStated event has been emitted.
        this.on('clientStated', () => {
            let index = 0
            //Start bot with message
            //bot.channels.fetch(this.id.textChanId[1]).then(channel => channel.send("Ping"))
            // Set bot presense every 20 sec
            setInterval(() => {
                bot.user.setPresence(
                    { 
                        activity: { name: this.presence[index].name, type: this.presence[index].type },
                        status: 'online'
                    })
                    index = (index === this.presence.length-1) ? 0 : ++index
            }, 20000)
        })
        */
        console.info(`Interface has logged in as ${bot.user.username}(ID:${bot.user.id})`)
        this.start()
    }

    async start () {
        if (this.state === STATES.STARTING || this.state === STATES.READY) {
            return console.info("Already started")
        }
        this.state = STATES.STARTING
        // Some synchronous commands
        try {
            listeners.startEventManagers(this.bot)
            this.state = STATES.READY
            console.info(`Interface has been started`)
            this.emit('clientStated')
        } catch (error) {
            console.error(`Error occur : ${error.message}`)
        }
    }

    async restart () {
        if (this.state === STATES.STARTING) return console.info(`Can't restart because of ${this.state} state`)
        if (this.state === STATES.READY) this.stop()
        console.info(`Restarting interface`)
        return this.start()
    }

    stop () {
        if (this.state === STATES.STARTING || this.state === STATES.STOPPED) {
            return console.info(`Can't stop because of ${this.state} state`)
        }
        console.info(`Interface has been stopped`)
        listeners.stopEventManagers(this.bot)
        this.state = STATES.STOPPED
    }
}

module.exports = Client