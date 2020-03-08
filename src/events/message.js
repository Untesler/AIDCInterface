const fs       = require("fs-extra"),
      path     = require("path"),
      commands = require("../util/commands")

const messageHandler = async client => {
  return async message => {
    const { master, commandPrefix, updateDetail } = await fs.readJsonSync(
      path.join(__dirname, "../config.json")
    );
    if (message.content.toLowerCase() === "ping")
      return message.reply("Pong!!");
    if (message.content.startsWith(`${commandPrefix} `)) {
      const command = message.content.substr(message.content.search(" ") + 1);
      return commands.run(client, message, command);
    }
  };
};

module.exports = messageHandler;
