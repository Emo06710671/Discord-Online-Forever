const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Replace TOKEN with your bot account's token
const bot = new Eris(process.env.token);

const VOICE_CHANNEL_ID = "1512898390864695370"; // Sesli kanal ID

bot.on("error", (err) => {
  console.error(err); // or your preferred logger
});

// Bot bağlandığında otomatik sesli kanala katıl
bot.on("ready", async () => {
  console.log("✅ Bot hazır! Sesli kanala katılıyor...");
  try {
    await bot.joinVoiceChannel(VOICE_CHANNEL_ID);
    console.log("✅ Sesli kanala başarıyla katıldı!");
  } catch (err) {
    console.error("❌ Sesli kanala katılamadı:", err);
    // Hata olursa 10 saniye sonra tekrar dene
    setTimeout(() => {
      bot.joinVoiceChannel(VOICE_CHANNEL_ID).catch(e => console.error("Tekrar deneme hatası:", e));
    }, 10000);
  }
});

// Bot sesli kanaldan çıkarılırsa otomatik geri katıl
bot.on("voiceChannelLeave", (member) => {
  if (member.id === bot.user.id) {
    console.log("⚠️ Bot sesli kanaldan çıkarıldı! Geri katılıyor...");
    setTimeout(() => {
      bot.joinVoiceChannel(VOICE_CHANNEL_ID).catch(e => console.error("Geri katılma hatası:", e));
    }, 5000);
  }
});

// Ses kanalına katılma komutu (opsiyonel)
bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!join")) {
    try {
      await bot.joinVoiceChannel(VOICE_CHANNEL_ID);
      msg.reply("✅ Sesli kanala katıldım!");
    } catch (err) {
      console.error("Ses kanalına katılma hatası:", err);
      msg.reply("❌ Sesli kanala katılamadım!");
    }
  }
  
  if (msg.content.startsWith("!leave")) {
    try {
      bot.leaveVoiceChannel(VOICE_CHANNEL_ID);
      msg.reply("👋 Sesli kanaldan ayrıldım!");
    } catch (err) {
      console.error("Ses kanalından ayrılma hatası:", err);
    }
  }
});

bot.connect(); // Get the bot to connect to Discord

