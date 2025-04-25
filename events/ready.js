const fs = require("fs");
const {
  Events,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  singlePreload,
  screenshotReviews,
} = require("../helpers/screenshotter");
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await singlePreload(client);
    setInterval(async () => {
      try {
        const path = await screenshotReviews(client);
        if (path) {
          const attachment = new AttachmentBuilder(path, {
            name: path,
          });
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`Screenshot saved: ${path}`);
        }
      } catch (e) {
        console.log(e);
      }
    }, 60000 * 30);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
