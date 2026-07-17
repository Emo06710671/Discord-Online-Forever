const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Bot token
const bot = new Eris(process.env.token, {
  intents: ["guildVoiceStates", "guilds", "guildMembers"]
});

// Sabit ses kanalı ID'si
const VOICE_CHANNEL_ID = "1512898390864695370";

console.log("🔧 Token:", process.env.token ? "✅ VAR" : "❌ YOK");
console.log("🔧 Ses Kanalı ID:", VOICE_CHANNEL_ID);

bot.on("error", (err) => {
  console.error("❌ BOT HATASI:", err);
});

bot.on("disconnect", () => {
  console.log("⚠️ Bot bağlantısı kesildi!");
});

// Bot bağlandığında hemen ses kanalına katıl
bot.on("connect", async () => {
  console.log("✅ Bot bağlantısı kuruldu! Ses kanalına katılıyor...");
  try {
    await bot.joinVoiceChannel(VOICE_CHANNEL_ID);
    console.log("✅ Bot ses kanalına başarıyla katıldı!");
    console.log("🎤 Bot artık o kanalda kalacak. PC kapatsan bile!");
  } catch (err) {
    console.error("❌ Ses kanalına katılamadı:", err.message);
    // Hata olursa 10 saniye sonra tekrar dene
    setTimeout(async () => {
      try {
        await bot.joinVoiceChannel(VOICE_CHANNEL_ID);
        console.log("✅ Yeniden deneme başarılı!");
      } catch (e) {
        console.error("❌ Yeniden deneme hatası:", e.message);
      }
    }, 10000);
  }
});

// Bağlantı kopması durumunda yeniden katıl
bot.on("voiceChannelLeave", async (oldChannel) => {
  if (oldChannel.id === VOICE_CHANNEL_ID) {
    console.log("⚠️ Bot kanaldan çıktı! Yeniden katılıyor...");
    setTimeout(async () => {
      try {
        await bot.joinVoiceChannel(VOICE_CHANNEL_ID);
        console.log("✅ Bot yeniden katıldı!");
      } catch (err) {
        console.error("❌ Yeniden katılma hatası:", err.message);
      }
    }, 5000);
  }
});

console.log("🔌 Bot bağlanıyor...");
bot.connect();

