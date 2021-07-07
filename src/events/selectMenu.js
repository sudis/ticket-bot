const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands");
const { channelAuth, ticketStats } = require("../functions");
const settings = require("../config/settings.json");

module.exports = {
  name: "selectMenu",
  once: false,
  run: async (client, menu) => {
    if (menu.id === "department_select") {
      let authorization = channelAuth(menu.channel);

      let claim_ticket = new MessageButton()
        .setLabel("Bileti Devral")
        .setStyle("gray")
        .setID("claim_ticket");

      if (menu.values[0] === "option_one_general_help") {
        menu.defer();
        ticketStats("general_ask", menu.clicker.user.id, 1);
        con.query(
          `UPDATE Tickets SET ticket_type = 'GENEL' WHERE member_id = '${menu.clicker.user.id}' AND pid = '${authorization}'`
        );

        let embed = new MessageEmbed()
          .setAuthor(
            `${menu.clicker.user.username}'nın Bileti`,
            menu.clicker.user.avatarURL({ dynamic: true })
          )
          .setDescription(
            `**${menu.clicker.user.username}** departman seçimini **Genel Yardım** olarak güncelledi. Yakın zamanda yetkililerden birisi biletinle ilgilenecek lütfen bekle.`
          )
          .setColor(settings.colors.panelEmbedColor);

        menu.message.edit({
          content: `${settings.ticketSettings.ticketFeelings.starEmoji} <@&${settings.ticketSettings.auths.generalDepartment}> bekleniyor...`,
          embeds: embed,
          components: new MessageActionRow().addComponent(claim_ticket),
        });

        let data = await con
          .promise()
          .query(
            `SELECT pid, opening_timestamp FROM Tickets WHERE member_id = '${menu.clicker.user.id}' AND ticket_status = 'AÇIK'`
          );

        menu.channel.edit({
          topic: `Bilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
            menu.clicker.user.tag
          }** |\nBilet Departmanı: **Genel Yardım** |\n\nBu bilet <t:${Math.floor(
            data[0][0].opening_timestamp
          )}:R> açılmış.`,
        });
      }

      if (menu.values[0] === "option_two_bug_help") {
        menu.defer();
        ticketStats("problem_ask", menu.clicker.user.id, 1);
        con.query(
          `UPDATE Tickets SET ticket_type = 'HATALAR' WHERE member_id = '${menu.clicker.user.id}' AND pid = '${authorization}'`
        );

        let embed = new MessageEmbed()
          .setAuthor(
            `${menu.clicker.user.username}'nın Bileti`,
            menu.clicker.user.avatarURL({ dynamic: true })
          )
          .setDescription(
            `**${menu.clicker.user.username}** departman seçimini **Hatalar** olarak güncelledi. Yakın zamanda yetkililerden birisi biletinle ilgilenecek lütfen bekle.`
          )
          .setColor(settings.colors.panelEmbedColor);

        menu.message.edit({
          content: `${settings.ticketSettings.ticketFeelings.starEmoji} <@&${settings.ticketSettings.auths.problemDepartment}> bekleniyor...`,
          embeds: embed,
          components: new MessageActionRow().addComponent(claim_ticket),
        });

        let data = await con
          .promise()
          .query(
            `SELECT pid, opening_timestamp FROM Tickets WHERE member_id = '${menu.clicker.user.id}' AND ticket_status = 'AÇIK'`
          );

        menu.channel.edit({
          topic: `Bilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
            menu.clicker.user.tag
          }** |\nBilet Departmanı: **Hatalar** |\n\nBu bilet <t:${Math.floor(
            data[0][0].opening_timestamp
          )}:R> açılmış.`,
        });
      }

      if (menu.values[0] === "option_three_suggestion_help") {
        menu.defer();
        ticketStats("suggestion_ask", menu.clicker.user.id, 1);
        con.query(
          `UPDATE Tickets SET ticket_type = 'ÖNERİLER' WHERE member_id = '${menu.clicker.user.id}' AND pid = '${authorization}'`
        );

        let embed = new MessageEmbed()
          .setAuthor(
            `${menu.clicker.user.username}'nın Bileti`,
            menu.clicker.user.avatarURL({ dynamic: true })
          )
          .setDescription(
            `**${menu.clicker.user.username}** departman seçimini **Öneriler** olarak güncelledi. Yakın zamanda yetkililerden birisi biletinle ilgilenecek lütfen bekle.`
          )
          .setColor(settings.colors.panelEmbedColor);

        menu.message.edit({
          content: `${settings.ticketSettings.ticketFeelings.starEmoji} <@&${settings.ticketSettings.auths.suggestionDepartment}> bekleniyor...`,
          embeds: embed,
          components: new MessageActionRow().addComponent(claim_ticket),
        });

        let data = await con
          .promise()
          .query(
            `SELECT pid, opening_timestamp FROM Tickets WHERE member_id = '${menu.clicker.user.id}' AND ticket_status = 'AÇIK'`
          );

        menu.channel.edit({
          topic: `Bilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
            menu.clicker.user.tag
          }** |\nBilet Departmanı: **Öneriler** |\n\nBu bilet <t:${Math.floor(
            data[0][0].opening_timestamp
          )}:R> açılmış.`,
        });
      }
    }
  },
};
