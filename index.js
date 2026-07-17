const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Bot token
const bot = new Eris(process.env.token, {
  intents: ["guildVoiceStates", "guilds", "guildMembers"]
});

// Sizin Discord ID'niz (main hesap)
const YOUR_USER_ID = "1523422874679902298";
let connectedChannelId = null;

console.log("🔧 Token:", process.env.token ? "✅ VAR" : "❌ YOK");
console.log("🔧 Ana Hesap ID:", YOUR_USER_ID);

bot.on("error", (err) => {
  console.error("❌ BOT HATASI:", err);
});

bot.on("disconnect", () => {
  console.log("⚠️ Bot bağlantısı kesildi!");
});

// Bot bağlandığında hazır
bot.on("ready", async () => {
  console.log("✅ Bot hazır! Siz ses kanalına giriş yaptığında otomatik katılacağım...");
});

// Ses kanalı olaylarını dinle
bot.on("voiceStateUpdate", async (oldState, newState) => {
  // Yalnızca main hesabınızın olaylarını izle
  if (newState.userId !== YOUR_USER_ID) return;

  // Siz ses kanalına girdiyseniz
  if (newState.channelId && !oldState.channelId) {
    try {
      connectedChannelId = newState.channelId;
      console.log(`🎤 Siz ses kanalına girdiniz (ID: ${newState.channelId}). Bot katılıyor...`);
      await bot.joinVoiceChannel(newState.channelId);
      console.log(`✅ Bot başarıyla ses kanalına katıldı! PC kapatsan bile kanalda kalacak.`);
    } catch (err) {
      console.error("❌ Bot ses kanalına katılamadı:", err);
    }
  }

  // Siz ses kanalından çıktıysanız
  if (!newState.channelId && oldState.channelId) {
    try {
      if (connectedChannelId) {
        console.log(`👋 Siz ses kanalından çıktınız. Bot da ayrılıyor...`);
        bot.leaveVoiceChannel(connectedChannelId);
        connectedChannelId = null;
        console.log(`✅ Bot ses kanalından ayrıldı!`);
      }
    } catch (err) {
      console.error("❌ Bot ses kanalından ayrılamadı:", err);
    }
  }
});

// Manuel komutlar (opsiyonel)
bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!join")) {
    try {
      if (msg.member?.voiceState?.channelId) {
        connectedChannelId = msg.member.voiceState.channelId;
        await bot.joinVoiceChannel(msg.member.voiceState.channelId);
        msg.reply("✅ Sesli kanala katıldım!");
      } else {
        msg.reply("❌ Önce siz bir sesli kanala katılmalısınız!");
      }
    } catch (err) {
      console.error("Ses kanalına katılma hatası:", err);
      msg.reply("❌ Sesli kanala katılamadım!");
    }
  }
  
  if (msg.content.startsWith("!leave")) {
    try {
      if (connectedChannelId) {
        bot.leaveVoiceChannel(connectedChannelId);
        connectedChannelId = null;
        msg.reply("👋 Sesli kanaldan ayrıldım!");
      }
    } catch (err) {
      console.error("Ses kanalından ayrılma hatası:", err);
    }
  }
});

console.log("🔌 Bot bağlanıyor...");
bot.connect();

