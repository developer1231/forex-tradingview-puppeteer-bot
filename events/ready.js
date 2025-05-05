const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");

const {
  makeForexFactoryScreenshot,
} = require("../helpers/screenshotForexFactory");

const {
  makeTradingViewScreenshots,
} = require("../helpers/screenshotTradingView");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);

    const channelId = "CHANNEL_ID "; //TODO:CHANGE TO ENV.

    cron.schedule("0 0 * * 0", async () => {
      console.log("📆 Running weekly Forex Factory screenshot job...");

      const [mentions, red, gray] = await makeForexFactoryScreenshot();
      const filePath = path.join(__dirname, "../filtered_calendar.png");

      const attachment = new AttachmentBuilder(filePath);
      const totalMentions = Object.entries(mentions)
        .filter(([_, count]) => count > 0)
        .map(([k, v]) => `**${k.toUpperCase()}**: ${v}`)
        .join(" • ");

      const embed = new EmbedBuilder()
        .setTitle("🗓️ Weekly Forex Factory Outlook")
        .setDescription(
          `Red: **${red}**, Gray: **${gray}**${
            totalMentions ? `\n🚨 Key mentions: ${totalMentions}` : ""
          }\n\n${
            totalMentions.includes("fomc")
              ? "⚠️ FOMC week! Expect volatility."
              : totalMentions.includes("speech")
              ? "🎤 Speech or speeches ahead!"
              : totalMentions.includes("bank holiday")
              ? "🏦 Bank holiday(s) incoming!"
              : "📊 Quiet week? Keep your eye on the charts anyway."
          }`
        )
        .setImage("attachment://filtered_calendar.png")
        .setColor(0xffcc00)
        .setTimestamp();

      const channel = await client.channels.fetch(channelId);
      await channel.send({ embeds: [embed], files: [attachment] });

      console.log("✅ Forex Factory embed sent.");
    });

    cron.schedule("0 0 * * 0", async () => {
      const weekNumber = Math.ceil(new Date().getDate() / 7);
      if (weekNumber % 2 === 1) {
        console.log("📈 Running biweekly TradingView screenshot job...");
        await makeTradingViewScreenshots();

        const imagesDir = path.resolve(__dirname, "../images");
        const channel = await client.channels.fetch(channelId);

        const files = fs
          .readdirSync(imagesDir)
          .filter((file) => file.endsWith(".png"));

        for (const file of files) {
          const attachment = new AttachmentBuilder(path.join(imagesDir, file));

          const embed = new EmbedBuilder()
            .setTitle(
              `📉 Seasonal Chart: ${file
                .replace("-seasonal.png", "")
                .toUpperCase()}`
            )
            .setImage(`attachment://${file}`)
            .setColor(0x1abc9c)
            .setTimestamp();

          await channel.send({ embeds: [embed], files: [attachment] });
          console.log(`✅ Sent ${file}`);
        }
      } else {
        console.log("⏭ Skipping TradingView job (not this week).");
      }
    });
  },
};
