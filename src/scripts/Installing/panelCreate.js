const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands");
const settings = require("../../config/settings.json")

module.exports = {
    name: "panel",
    description: "Bilet paneli oluşturmanızı sağlar.",
    userRequiredRole: settings.ticketSettings.auths.moderatorRole,
    slash: false,
    guildOnly: settings.bot.guildID,
    run: async({client, interaction, member, message, guild, channel, respond, edit}, args) => {

      let embed = new MessageEmbed()
      .setAuthor("Bilet Oluşturma")
      .setDescription(`Bize ulaşmak istersen bir bilet oluşturman yeterli olacak. Gereksiz bilet açanlar cezalandırılır.`)
      .setColor(settings.colors.panelEmbedColor)

      let button = new MessageButton()
      .setLabel("Bilet Aç")
      .setStyle("gray")
      .setID("create_ticket_button")

      respond({
        embeds: embed,
        components: new MessageActionRow().addComponent(button),
        inlineReply: false
      })

  }
};