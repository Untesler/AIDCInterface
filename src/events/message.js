const fs       = require("fs-extra"),
      path     = require("path"),
      commands = require("../util/commands")

const messageHandler = async client => {
  return async message => {
    const { master, commandPrefix, updateDetail } = await fs.readJsonSync(
      path.join(__dirname, "../config.json")
    );
    try {
      if (message.content.toLowerCase() === "ping")
        message.reply("Pong!!");
      if (message.content.startsWith(`${commandPrefix} `)) {
        const command = message.content.substr(message.content.search(" ") + 1);
        await commands.run(client, message, command);
        message.delete()
      }
    } catch (error) {
      console.error(`Error occur when try to handler message event : ${error.message}`)
    }
    return
  };
};

module.exports = messageHandler;
