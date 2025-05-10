const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const moment = require("moment-timezone");
const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const {
  makeWeeklyForexFactoryScreenshot,
  makeDailyForexScreenshot,
} = require("../helpers/screenshotForexFactory");

const {
  makeTradingViewScreenshots,
} = require("../helpers/screenshotTradingView");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);

    const elite_channel_id = "1304186111236636734";
    const news_channel_id = "1296516666615922688";
    const tradingview_channel_id = "1356079296015503510";

    // 🕒 Daily Economic Calendar - Every day at midnight New York time
    cron.schedule("0 0 * * *", async () => {
      const now = moment().tz("America/New_York");
      if (now.hour() !== 0) return;

      console.log("🕒 Running daily Forex screenshot job...");
      await makeDailyForexScreenshot();

      const filePath = path.join(__dirname, "../daily_calendar.png");
      const attachment = new AttachmentBuilder(filePath);

      const embed = new EmbedBuilder()
        .setTitle("📅 Daily Economic Calendar")
        .setDescription("Here’s today’s filtered economic events.")
        .setImage("attachment://daily_calendar.png")
        .setColor(0x3498db)
        .setTimestamp();

      for (const channelId of [news_channel_id, elite_channel_id]) {
        const channel = await client.channels.fetch(channelId);
        await channel.send({ embeds: [embed], files: [attachment] });
      }

      console.log("✅ Daily Forex embed sent to both channels.");
    });

    // 🗓️ Weekly Economic Outlook - Every Sunday at midnight New York time
    cron.schedule("0 0 * * 0", async () => {
      const now = moment().tz("America/New_York");
      if (now.hour() !== 0) return;

      console.log("🕒 Running weekly Forex Factory screenshot job...");

      const [mentions, red, gray] = await makeWeeklyForexFactoryScreenshot();
      const filePath = path.join(__dirname, "../filtered_calendar.png");

      const attachment = new AttachmentBuilder(filePath);
      const totalMentions = Object.entries(mentions)
        .filter(([_, count]) => count > 0)
        .map(([k, v]) => `**${k.toUpperCase()}**: ${v}`)
        .join(" • ");

      const embed = new EmbedBuilder()
        .setTitle("🗓️ Weekly Economic Outlook")
        .setDescription(
          `Red: **${red}**, Gray: **${gray}**${
            totalMentions
              ? `\n🚨 Key mentions: ${totalMentions.replace(
                  "SPEAKS",
                  "SPEECHES"
                )}`
              : ""
          }\n\n${
            totalMentions.includes("FOMC")
              ? "⚠️ FOMC week! Expect volatility."
              : totalMentions.includes("SPEECH") ||
                totalMentions.includes("SPEAKS")
              ? "🎤 Speech or speeches ahead!"
              : totalMentions.includes("BANK HOLIDAY")
              ? "🏦 Bank holiday(s) incoming!"
              : ""
          }`
        )
        .setImage("attachment://filtered_calendar.png")
        .setColor(0x3498db)
        .setTimestamp();

      const channel = await client.channels.fetch(news_channel_id);
      await channel.send({ embeds: [embed], files: [attachment] });

      console.log("✅ Weekly Forex Factory embed sent.");
    });

    // 📈 Monthly TradingView Screenshots - First day of the month at midnight New York time
    cron.schedule("0 0 1 * *", async () => {
      const now = moment().tz("America/New_York");
      if (now.hour() !== 0) return;

      console.log("🕒 Running monthly TradingView screenshot job...");
      await makeTradingViewScreenshots();

      const imagesDir = path.resolve(__dirname, "../images");
      const channel = await client.channels.fetch(tradingview_channel_id);

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
          .setColor(0x3498db)
          .setTimestamp();

        await channel.send({ embeds: [embed], files: [attachment] });
        console.log(`✅ Sent ${file}`);
      }

      console.log("🎉 Monthly TradingView charts sent.");
    });

    console.log("📅 All cron jobs scheduled.");
  },
};
