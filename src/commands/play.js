const ytdl             = require("ytdl-core"),
      axios            = require("axios"),
      fs               = require("fs-extra"),
      path             = require("path"),
      { MessageEmbed } = require("discord.js");

async function play(mQueue, player) {
  player.dispacher = await player.play(
    ytdl(mQueue.queue[0].url, {
      filter : "audioonly",
      quality: "highestaudio"
    }),
    {
      bitrate: "auto",
      volume : 0.7
    }
  );
  player.dispacher.once("finish", () => finish(mQueue, player));
}

async function finish(mQueue, player) {
  const final = [];
  if (mQueue.queue.length === 1) {
    final.push(mQueue.queue[0].url);
    final.push(mQueue.queue[0].requestor);
    final.push(true);
    final.push(mQueue.embed);
  }
  mQueue.queue.shift();
  if (mQueue.queue.length > 0) {
    const embed     = mQueue.embed,
          requestor = mQueue.queue[0].requestor,
          url       = mQueue.queue[0].url;
    const newEmbed  = await embedBuilder(url, requestor);
    await embed.edit(newEmbed);
    play(mQueue, player);
  } else {
    const newEmbed = await embedBuilder(...final);
    await final[3].edit(newEmbed);
  }
}

async function embedBuilder(url, requestor, final = false) {
  const ytInfo = await ytdl.getBasicInfo(url),
        embed  = new MessageEmbed();
  await axios.get(
    `http://i3.ytimg.com/vi/${ytInfo.video_id}/maxresdefault.jpg`,
    {
      validateStatus: status => {
        if (status === 404) {
          return embed.setImage(
            `http://i3.ytimg.com/vi/${ytInfo.video_id}/hqdefault.jpg`
          );
        }
        return embed.setImage(
          `http://i3.ytimg.com/vi/${ytInfo.video_id}/maxresdefault.jpg`
        );
      }
    }
  );
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${requestor.id}/${requestor.avatar}`
  );
  embed.setDescription(
    `ขณะนี้กำลังเล่น ${ytInfo.title} ที่ถูกร้องขอโดยนายท่าน ${requestor.username} อยู่ค่ะ`
  );
  embed.setURL(url);
  if (final) embed.setTitle(":stop_button: สิ้นสุดการเล่นไฟล์เสียงค่ะ");
  else embed.setTitle(`:play_pause: กำลังเล่นไฟล์เสียง`);
  return embed;
}

module.exports = async (client, msg) => {
  const botName = client.user.username;
  let   url     = msg.content.split(" ")[2];
  try {
    const map    = client.voice.connections.values().next().value,
          player = map.dispatcher || map.player.voiceConnection;
    if (msg.member.voice.channel.id !== map.channel.id) {
      return msg.reply(
        `ขอโทษค่ะ แต่นายท่านไม่ได้อยู่ใน Channel เดียวกันกับ ${botName} นะคะ :thinking:`
      );
    }
    if (url === undefined && player.paused) {
        if (player.paused) {
          const embed = await embedBuilder(
            map.musicsQueue.queue[0].url,
            map.musicsQueue.queue[0].requestor
          );
          map.musicsQueue.embed.edit(embed);
          return player.resume();
        } else {
          return msg.reply(
            `ขอโทษค่ะนายท่าน แต่กรณีที่ไม่ได้ต้องการจะเล่นไฟล์เสียงต่อรบกวนใส่ URL มาให้ ${botName} ด้วยนะคะ`
          );
        }
    }
    if (ytdl.validateURL(url)) {
      if (!map.musicsQueue) map.musicsQueue = { embed: undefined, queue: [] };
      if (url.search("list=") !== -1) {
        /* 
          If the given link is a youtube playlist, 
           then you need to provide a key for youtube data api 
           in ../../config/credentials.json 
           */

        try {
          const playlistId  = url.split("list=")[1].split("&")[0],
                maxResults  = 25,
                credentials = fs.readJsonSync(
                    path.join(__dirname, "../../config/credentials.json")
                );
          axios(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${credentials.googleAPI}`
          )
            .then(res => {
              for (data of res.data.items) {
                const videoURL = `https://www.youtube.com/watch?v=${data.contentDetails.videoId}`;
                map.musicsQueue.queue.push({
                  requestor: msg.author,
                  url      : videoURL
                });
              }
            })
            .catch(err => {
              if (err) {
                console.error(`googleAPI : ${err.message}`);
                return map.musicsQueue.queue.push({
                  requestor: msg.author,
                  url      : url
                });
              }
            });
        } catch (err) {
          if (err.code === "ENOENT") {
            fs.writeJsonSync(
              path.join(__dirname, "../../config/credentials.json"),
              { googleAPI: "<YOUR_YOUTUBE_DATA_API_KEY>" }
            );
            console.warn(
              "To parse the playlist, you need to provide a youtube data api key on ../../config/credentials.json"
            );
          } else {
            console.error(`Error occurs: ${err.message}`);
          }
          map.musicsQueue.queue.push({
            requestor: msg.author,
            url      : url
          });
        }
      } else {
        map.musicsQueue.queue.push({
          requestor: msg.author,
          url      : url
        });
      }
      if (!map.dispatcher) {
        const embed                 = await embedBuilder(url, msg.author),
              msgEmbed              = await msg.channel.send(embed);
              map.musicsQueue.embed = msgEmbed;
        play(map.musicsQueue, player);
      } else {
        const addedMsg = await msg.channel.send(
          `ทำการเพิ่มรายการลงไปใน Playlist แล้วค่ะ :white_check_mark:`
        );
        setTimeout(() => {
          addedMsg.delete();
        }, 2000);
      }
    } else {
      return msg.reply(
        `ขอโทษค่ะนายท่าน แต่ ${botName} ไม่สามารถเล่นเสียงบน URL ที่ร้องขอได้ค่ะ :face_with_monocle:`
      );
    }
  } catch (error) {
    if (error.message.includes("No video id found:")) {
      return msg.reply(
        `ขอโทษค่ะนายท่าน แต่ ${botName} ไม่สามารถค้นหาสื่อเสียงที่ร้องขอได้ค่ะ :face_with_monocle:`
      );
    }
    if (error instanceof TypeError) {
      console.error(error.message);
      return msg.reply(
        `ตอนนี้ ${botName} ไม่ได้อยู่ใน Channel ไหนเลยค่ะ :disappointed_relieved:`
      );
    } else {
      console.error(`Error occurs: ${error.message}`);
      msg.reply(
        "ขอด้วยค่ะ เนื่องจากข้อผิดพลาดของระบบจึงทำให้ไม่สามารถปฏิบัติตามคำร้องขอได้ค่ะ :sob:"
      );
    }
  } 
};
