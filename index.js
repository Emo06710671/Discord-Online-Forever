const Eris = require("eris");
const keep_alive = require('./keep_alive.js')

// Bot token
const bot = new Eris(process.env.token, {
  intents: ["guildVoiceStates", "guilds", "guildMembers", "directMessages"]
});

let currentVoiceChannel = null;
let currentGuildId = null;

console.log("🔧 Token:", process.env.token ? "✅ VAR" : "❌ YOK");
console.log("🔌 Bot bağlanıyor...");

bot.on("error", (err) => {
  console.error("❌ BOT HATASI:", err);
});

bot.on("disconnect", () => {
  console.log("⚠️ Bot bağlantısı kesildi!");
});

// DM mesajlarını dinle
bot.on("messageCreate", async (msg) => {
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
          currentGuildId = null;
          msg.author.getDMChannel().then(dm => dm.createMessage("✅ Ses kanalından çıktım!"));
          console.log("✅ Bot ses kanalından çıktı");
        } catch (err) {
          console.error("❌ Çıkma hatası:", err.message);
          msg.author.getDMChannel().then(dm => dm.createMessage("❌ Çıkamadım: " + err.message));
        }
      } else {
        msg.author.getDMChannel().then(dm => dm.createMessage("⚠️ Zaten hiçbir kanaldda değilim!"));
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
        currentGuildId = serverId;
        msg.author.getDMChannel().then(dm => dm.createMessage(`✅ <#${channelId}> kanalına katıldım! 🎤 Sonsuza dek burada kalacağım...`));
        console.log(`✅ Bot ${channelId} kanalına katıldı! (Server: ${serverId})`);
      } catch (err) {
        console.error("❌ Kanala katılma hatası:", err.message);
        msg.author.getDMChannel().then(dm => dm.createMessage("❌ Kanala katılamadım: " + err.message));
      }
    }
  }
});

// Bot bağlantısı kopunca yeniden katıl
bot.on("voiceChannelLeave", async (oldChannel) => {
  console.log(`⚠️ Bot ${oldChannel.id} kanalından çıktı!`);
  
  if (currentVoiceChannel && oldChannel.id === currentVoiceChannel) {
    console.log("🔄 Yeniden katılmayı deniyorum...");
    setTimeout(async () => {
      try {
        await bot.joinVoiceChannel(currentVoiceChannel);
        console.log(`✅ Bot yeniden ${currentVoiceChannel} kanalına katıldı!`);
      } catch (err) {
        console.error("❌ Yeniden katılma hatası:", err.message);
        // 5 saniye sonra tekrar dene
        setTimeout(async () => {
          try {
            await bot.joinVoiceChannel(currentVoiceChannel);
            console.log(`✅ İkinci deneme başarılı! Bot ${currentVoiceChannel} kanalında!`);
          } catch (e) {
            console.error("❌ İkinci deneme hatası:", e.message);
          }
        }, 5000);
      }
    }, 3000);
  }
});

// Bot bağlandığında
bot.on("connect", () => {
  console.log("✅ Bot bağlantısı kuruldu!");
  
  // Sonsuza dek çevrimiçi statüsü ayarla
  bot.editStatus("online", {
    name: "🎤 Sesli Sohbet",
    type: 2  // LISTENING
  });
  
  console.log("🟢 Bot SONSUZA DEK çevrimiçi olarak ayarlandı!");
});

// Disconnection durumunda reconnect
bot.on("shardDisconnect", () => {
  console.log("🔌 Bot bağlantısı kesildi, yeniden bağlanıyor...");
  setTimeout(() => {
    bot.connect();
  }, 5000);
});

console.log("🔌 Bot başlatılıyor...");
bot.connect();

