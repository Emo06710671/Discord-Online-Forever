const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Bot token
const bot = new Eris(process.env.token, {
  intents: ["guildVoiceStates", "guilds", "guildMembers", "directMessages", "messageContent"]
});

let currentVoiceChannel = null;

console.log("🔧 Token:", process.env.token ? "✅ VAR" : "❌ YOK");
console.log("🔌 Bot bağlanıyor...");

bot.on("error", (err) => {
  console.error("❌ BOT HATASI:", err);
});

bot.on("disconnect", () => {
  console.log("⚠️ Bot bağlantısı kesildi!");
});

// Tüm mesajları dinle
bot.on("messageCreate", async (msg) => {
  try {
    // Eğer DM ise ve bot kendisine yazılmamışsa
    if (msg.channel.isDM && msg.author.id !== bot.user.id) {
      const content = msg.content.trim();
      
      console.log("📨 DM alındı:", content);
      
      // Çık komutu
      if (content.toLowerCase() === "çık") {
        if (currentVoiceChannel) {
          try {
            bot.leaveVoiceChannel(currentVoiceChannel);
            currentVoiceChannel = null;
            await msg.channel.createMessage("✅ Ses kanalından çıktım!");
            console.log("✅ Bot ses kanalından çıktı");
          } catch (err) {
            console.error("❌ Çıkma hatası:", err.message);
            await msg.channel.createMessage("❌ Çıkamadım: " + err.message);
          }
        } else {
          await msg.channel.createMessage("⚠️ Zaten hiçbir kanaldda değilim!");
        }
        return;
      }
      
      // Voice channel linki kontrol et
      // Format: https://discordapp.com/channels/SERVER_ID/CHANNEL_ID
      const voiceChannelMatch = content.match(/channels\/(\d+)\/(\d+)/);
      
      if (voiceChannelMatch) {
        const serverId = voiceChannelMatch[1];
        const channelId = voiceChannelMatch[2];
        
        console.log(`🔗 Voice channel linki alındı - Server: ${serverId}, Channel: ${channelId}`);
        
        try {
          // Kanala katıl
          await bot.joinVoiceChannel(channelId);
          currentVoiceChannel = channelId;
          await msg.channel.createMessage(`✅ <#${channelId}> kanalına katıldım!`);
          console.log(`✅ Bot ${channelId} kanalına katıldı!`);
        } catch (err) {
          console.error("❌ Kanala katılma hatası:", err.message);
          await msg.channel.createMessage("❌ Kanala katılamadım: " + err.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ Mesaj işleme hatası:", err);
  }
});

// Bot bağlandığında
bot.on("connect", () => {
  console.log("✅ Bot bağlantısı kuruldu!");
});

console.log("🔌 Bot başlatılıyor...");
bot.connect();

