const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Replace TOKEN with your bot account's token
const bot = new Eris(process.env.token);

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

// Ses kanalına katılma komutu
bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!join")) {
    if (!msg.member.voiceState.channelID) {
      return msg.reply("❌ Önce sen bir sesli kanala katıl!");
    }
    
    try {
      const voiceChannel = bot.getChannel(msg.member.voiceState.channelID);
      await bot.joinVoiceChannel(msg.member.voiceState.channelID);
      msg.reply("✅ Sesli kanala katıldım!");
    } catch (err) {
      console.error("Ses kanalına katılma hatası:", err);
      msg.reply("❌ Sesli kanala katılamadım!");
    }
  }
  
  if (msg.content.startsWith("!leave")) {
    try {
      bot.leaveVoiceChannel(msg.member.voiceState.channelID);
      msg.reply("👋 Sesli kanaldan ayrıldım!");
    } catch (err) {
      console.error("Ses kanalından ayrılma hatası:", err);
    }
  }
});

bot.connect(); // Get the bot to connect to Discord

