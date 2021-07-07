const settings = require("../config/settings.json");
const { channelAuth, ticketStats } = require("../functions");
const dayjs = require("dayjs");
const { MessageEmbed } = require("discord.js");
const {
  MessageSelectMenuOption,
  MessageSelectMenu,
  MessageActionRow,
  MessageButton,
} = require("gcommands");
dayjs.locale("TR");

module.exports = {
  name: "clickButton",
  once: false,
  run: async (client, button) => {
    if (button.id === "create_ticket_button") {
      con.query(
        `SELECT * FROM Tickets WHERE member_id = '${button.clicker.user.id}' AND ticket_status = 'AÇIK'`,
        async (err, rows) => {
          if (err) throw err;
          if (rows.length < 1) {
            con.query(
              `INSERT INTO Tickets (member_id, opening_timestamp) VALUES ('${
                button.clicker.user.id
              }', '${Math.floor(Date.now() / 1000)}')`
            );
            ticketStats("opened_tickets", button.clicker.user.id, 1);
            let number = await con
              .promise()
              .query(
                `SELECT pid FROM Tickets WHERE member_id = '${button.clicker.user.id}' AND ticket_status = 'AÇIK'`
              );

            let ticketChannel = await button.guild.channels.create(
              `ticket-${number[0][0].pid}`,
              {
                type: "text",
                topic: `Bilet Numarası: **${
                  number[0][0].pid
                }** |\nBilet Sahibi: **${
                  button.clicker.user.tag
                }** |\nBilet Departmanı: **Henüz Seçilmedi** |\n\nBu bilet <t:${Math.floor(
                  Date.now() / 1000
                )}:R> açılmış.`,
                parent: settings.ticketSettings.rooms.ticketParent,
                permissionOverwrites: [
                  {
                    id: button.clicker.user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
                  },
                  {
                    id: button.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"],
                  },
                  {
                    id: settings.ticketSettings.auths.moderatorRole,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
                  },
                ],
              }
            );

            con.query(
              `UPDATE Tickets SET ticket_room = '${ticketChannel.id}' WHERE pid = '${number[0][0].pid}'`
            );

            let embed = new MessageEmbed()
              .setAuthor(
                `${button.clicker.user.username}'nın Bileti`,
                button.clicker.user.avatarURL({ dynamic: true })
              )
              .setDescription(
                `**${button.clicker.user.username}** bir bilet oluşturduğun için teşekkürler. Yardım almak istediğin departmanı aşağıdan seçmelisin.`
              )
              .setColor(settings.colors.welcomeEmbedColor);

            let option_one = new MessageSelectMenuOption()
              .setLabel("Genel Yardım")
              .setDescription("Sunucuyla ilgili problemler burada yer alır.")
              .setValue("option_one_general_help")
              .setEmoji(
                settings.ticketSettings.ticketFeelings.generalHelpEmoji
              );

            let option_two = new MessageSelectMenuOption()
              .setLabel("Hatalar")
              .setDescription("Alınan hataları burada bildirebilirsin.")
              .setValue("option_two_bug_help")
              .setEmoji(settings.ticketSettings.ticketFeelings.bugHelpEmoji);

            let option_three = new MessageSelectMenuOption()
              .setLabel("Öneriler")
              .setDescription("Yapacağın önerileri bize bildir.")
              .setValue("option_three_suggestion_help")
              .setEmoji(
                settings.ticketSettings.ticketFeelings.suggestionHelpEmoji
              );

            let menu = new MessageSelectMenu()
              .setID("department_select")
              .setMaxValues(1)
              .setMinValues(1)
              .setPlaceholder("Bir departman seçiniz.")
              .addOption(option_one)
              .addOption(option_two)
              .addOption(option_three);

            ticketChannel.send({
              content: `${settings.ticketSettings.ticketFeelings.starEmoji} **${button.clicker.user.username}** bekleniyor...`,
              embeds: embed,
              components: new MessageActionRow().addComponent(menu),
            });
          } else {
            button.reply.send({
              content:
                "Halihazırda biletlerinden birisi **açık** olduğu için bilet oluşturma eylemini yapamazsın.",
              ephemeral: true,
              inlineReply: false,
            });
          }
        }
      );
    }

    if (button.id === "claim_ticket") {
      let check =
        button.clicker.member.roles.cache.has(
          settings.ticketSettings.auths.moderatorRole
        ) ||
        button.clicker.member.roles.cache.has(
          settings.ticketSettings.auths.generalDepartment
        ) ||
        button.clicker.member.roles.cache.has(
          settings.ticketSettings.auths.problemDepartment
        ) ||
        button.clicker.member.roles.cache.has(
          settings.ticketSettings.auths.suggestionDepartment
        );
      if (check == false)
        return button.reply.send({
          content:
            "Herhangi bir departmanda yer almadığın için bu bileti kabul edemezsin.",
          ephemeral: true,
        });

      button.defer();
      let data = await con
        .promise()
        .query(
          `SELECT * FROM Tickets WHERE pid = '${channelAuth(button.channel)}'`
        );
      let member = client.users.cache.get(data[0][0].member_id);

      con.query(
        `UPDATE Tickets SET claimed_staff = '${
          button.clicker.user.id
        }' WHERE pid = '${channelAuth(button.channel)}'`
      );
      button.channel.edit({
        topic: `**[DEVRALINDI: ${
          button.clicker.user.tag
        }]** |\nBilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
          client.users.cache.get(data[0][0].member_id).tag
        }** |\nBilet Departmanı: **${data[0][0].ticket_type
          .replace("GENEL", "Genel Yardım")
          .replace("HATALAR", "Hatalar")
          .replace("ÖNERİLER", "Öneriler")}** |\n\nBu bilet <t:${Math.floor(
          data[0][0].opening_timestamp
        )}:R> açılmış.`,
        name: `ticket-claimed-${data[0][0].pid}`,
        parent: settings.ticketSettings.rooms.ticketParent,
      });

      let claimed_embed = new MessageEmbed()
        .setAuthor(
          `${member.username}'nın Bileti`,
          member.avatarURL({ dynamic: true })
        )
        .setDescription(
          `**${member.username}** biletin bir yetkili tarafından devralındı. Biletinle ilgili diğer işlemleri bu kanaldan takip etmeyi unutma.`
        )
        .setColor(settings.colors.claimEmbedColor);

      let close_ticket = new MessageButton()
        .setLabel("Bileti Kapat")
        .setStyle("red")
        .setID("close_ticket");

      button.message.edit({
        content: `${settings.ticketSettings.ticketFeelings.starEmoji} **${member.username}** biletin devralındı!`,
        embeds: claimed_embed,
        components: new MessageActionRow().addComponent(close_ticket),
      });

      button.channel.send({
        content: `\`[SİSTEM]:\` Yetkili **${button.clicker.user.username}** bu bileti devraldı. Bilet ile ilgili bilgileri kanal açıklamasından okuyabilirsiniz.`,
      });
    }

    if (button.id === "close_ticket") {
      con.query(
        `UPDATE Tickets SET ticket_status = 'KAPALI' WHERE pid = '${channelAuth(
          button.channel
        )}'`
      );
      console.log(channelAuth(button.channel));
      let data = await con
        .promise()
        .query(
          `SELECT * FROM Tickets WHERE pid = '${channelAuth(button.channel)}'`
        );
      button.channel.edit({
        name: `ticket-closed-${channelAuth(button.channel)}`,
        parent: settings.ticketSettings.rooms.ticketParent,
        topic: `**[KAPATILDI: ${
          client.users.cache.get(data[0][0].claimed_staff).tag
        }]** |\nBilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
          client.users.cache.get(data[0][0].member_id).tag
        }** |\nBilet Departmanı: **${data[0][0].ticket_type
          .replace("GENEL", "Genel Yardım")
          .replace("HATALAR", "Hatalar")
          .replace("ÖNERİLER", "Öneriler")}** |\n\nBu bilet <t:${Math.floor(
          data[0][0].opening_timestamp
        )}:R> açılmış.`,
        permissionOverwrites: [
          {
            id: data[0][0].member_id,
            deny: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
          {
            id: button.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: settings.ticketSettings.auths.moderatorRole,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
        ],
      });

      let embed = new MessageEmbed()
        .setAuthor(
          `${client.users.cache.get(data[0][0].member_id).username}'nın Bileti`,
          client.users.cache
            .get(data[0][0].member_id)
            .avatarURL({ dynamic: true })
        )
        .setDescription(
          `Bu bilet kapatıldı. Seçilen departman ${data[0][0].ticket_type
            .replace("GENEL", "Genel Yardım")
            .replace("HATALAR", "Hatalar")
            .replace(
              "ÖNERİLER",
              "Öneriler"
            )} departmanıydı. Bileti devralan yetkili **${
            client.users.cache.get(data[0][0].claimed_staff).tag
          }**.`
        )
        .setColor(settings.colors.welcomeEmbedColor);

      let delete_ticket = new MessageButton()
        .setLabel("Bileti Sil")
        .setStyle("red")
        .setID("delete_ticket");

      let reopen_ticket = new MessageButton()
        .setLabel("Bileti Tekrar Aç")
        .setStyle("green")
        .setID("reopen_ticket");

      let archive_ticket = new MessageButton()
        .setLabel("Bileti Arşivle")
        .setStyle("gray")
        .setID("archive_ticket");

      button.message.edit({
        content: `${settings.ticketSettings.ticketFeelings.starEmoji} Bu bilet şu anda **kapalı**.`,
        embeds: embed,
        components: new MessageActionRow()
          .addComponent(delete_ticket)
          .addComponent(reopen_ticket)
          .addComponent(archive_ticket),
      });

      button.defer();

      button.channel.send({
        content: `\`[SİSTEM]:\` Bu bilet **${button.clicker.user.tag}** tarafından kapatıldı.`,
      });
    }

    if (button.id === "delete_ticket") {
      con.query(
        `UPDATE Tickets SET ticket_status = 'SİLİNMİŞ' WHERE pid = '${channelAuth(
          button.channel
        )}'`
      );
      button.defer();
      button.channel.send({
        content: `\`[SİSTEM]:\` Bu bilet **beş saniye** içerisinde silinecek.`,
      });
      setTimeout(() => {
        button.channel.delete();
      }, 5000);
    }

    if (button.id === "reopen_ticket") {
      button.defer();
      con.query(
        `UPDATE Tickets SET ticket_status = 'AÇIK' WHERE pid = '${channelAuth(
          button.channel
        )}'`
      );
      let data = await con
        .promise()
        .query(
          `SELECT * FROM Tickets WHERE pid = '${channelAuth(button.channel)}'`
        );

      button.channel.edit({
        name: `ticket-${channelAuth(button.channel)}`,
        parent: settings.ticketSettings.rooms.ticketParent,
        topic: `**[TEKRAR AÇILDI: ${
          client.users.cache.get(data[0][0].claimed_staff).tag
        }]** |\nBilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
          client.users.cache.get(data[0][0].member_id).tag
        }** |\nBilet Departmanı: **${data[0][0].ticket_type
          .replace("GENEL", "Genel Yardım")
          .replace("HATALAR", "Hatalar")
          .replace("ÖNERİLER", "Öneriler")}** |\n\nBu bilet <t:${Math.floor(
          data[0][0].opening_timestamp
        )}:R> açılmış.`,
        permissionOverwrites: [
          {
            id: data[0][0].member_id,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
          {
            id: button.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: settings.ticketSettings.auths.moderatorRole,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
        ],
      });

      let embed = new MessageEmbed()
        .setAuthor(
          `${client.users.cache.get(data[0][0].member_id).username}'nın Bileti`,
          client.users.cache
            .get(data[0][0].member_id)
            .avatarURL({ dynamic: true })
        )
        .setDescription(
          `Bilet tekrar aktif halde. Bileti açan **${
            client.users.cache.get(data[0][0].member_id).tag
          }** ve biletten sorumlu yetkili **${
            client.users.cache.get(data[0][0].claimed_staff).tag
          }** yakında buraya gelecekler.`
        )
        .setColor(settings.colors.welcomeEmbedColor);

      let close_ticket = new MessageButton()
        .setLabel("Bileti Kapat")
        .setStyle("red")
        .setID("close_ticket");

      button.message.edit({
        content: `${
          settings.ticketSettings.ticketFeelings.starEmoji
        } ${client.users.cache.get(
          data[0][0].member_id
        )} **&** ${client.users.cache.get(
          data[0][0].claimed_staff
        )} bekleniyor...`,
        embeds: embed,
        components: new MessageActionRow().addComponent(close_ticket),
      });

      button.channel.send({
        content: `\`[SİSTEM]:\` Bu bilet tekrar açıldı. Bileti açan ${client.users.cache.get(
          data[0][0].member_id
        )} ve bu biletten sorumlu olan ${client.users.cache.get(
          data[0][0].claimed_staff
        )} bu kanalda beklemelisiniz.`,
      });

      client.users.cache
        .get(data[0][0].claimed_staff)
        .send(
          `\`[SİSTEM]:\` Bir bilet tekrar açıldı. Kontrol etmek istersen <#${data[0][0].ticket_room}> odasına git.`
        )
        .catch((e) => {
          button.channel.send({
            content: `\`[SİSTEM]:\` Yetkiliye özel mesaj yoluyla mesaj gönderilemedi.`,
          });
        });
      client.users.cache
        .get(data[0][0].member_id)
        .send(
          `\`[SİSTEM]:\` Bir bilet tekrar açıldı. Kontrol etmek için <#${data[0][0].ticket_room}> odasına git.`
        )
        .catch((e) => {
          button.channel.send({
            content: `\`[SİSTEM]:\` Üyeye özel mesaj yoluyla mesaj gönderilemedi.`,
          });
        });
    }

    if (button.id === "archive_ticket") {
      button.defer();
      let data = await con
        .promise()
        .query(
          `SELECT * FROM Tickets WHERE pid = '${channelAuth(button.channel)}'`
        );
      con.query(
        `UPDATE Tickets SET ticket_status = 'ARŞİVDE' WHERE pid = '${channelAuth(
          button.channel
        )}'`
      );

      button.channel.edit({
        name: `ticket-archived-${channelAuth(button.channel)}`,
        parent: settings.ticketSettings.rooms.archiveParent,
        topic: `**[ARŞİVLENDİ: ${
          client.users.cache.get(data[0][0].claimed_staff).tag
        }]** |\nBilet Numarası: **${data[0][0].pid}** |\nBilet Sahibi: **${
          client.users.cache.get(data[0][0].member_id).tag
        }** |\nBilet Departmanı: **${data[0][0].ticket_type
          .replace("GENEL", "Genel Yardım")
          .replace("HATALAR", "Hatalar")
          .replace("ÖNERİLER", "Öneriler")}** |\n\nBu bilet <t:${Math.floor(
          data[0][0].opening_timestamp
        )}:R> açılmış.`,
        permissionOverwrites: [
          {
            id: data[0][0].member_id,
            deny: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
          {
            id: button.guild.roles.everyone,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: settings.ticketSettings.auths.moderatorRole,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
          },
        ],
      });

      let embed = new MessageEmbed()
        .setAuthor(
          `${client.users.cache.get(data[0][0].member_id).username}'nın Bileti`,
          client.users.cache
            .get(data[0][0].member_id)
            .avatarURL({ dynamic: true })
        )
        .setDescription(
          `Bu bilet şu anda arşivde. Arşivdeyken biletler silinemez ve biletlere eylem uygulanamaz. Bileti arşivden çıkartmak için aşağıdaki butonu kullanabilirsin.`
        )
        .setColor(settings.colors.welcomeEmbedColor);

      let delete_ticket = new MessageButton()
        .setLabel("Bileti Sil")
        .setStyle("red")
        .setID("delete_ticket");

      let unarchive_ticket = new MessageButton()
        .setLabel("Bileti Arşivden Çıkar")
        .setStyle("green")
        .setID("reopen_ticket");

      button.message.edit({
        content: `${settings.ticketSettings.ticketFeelings.starEmoji} Bu bilet arşive alındı.`,
        embeds: embed,
        components: new MessageActionRow()
          .addComponent(delete_ticket)
          .addComponent(unarchive_ticket),
      });

      button.channel.send({
        content: `\`[SİSTEM]:\` Bu bilet **${button.clicker.user.tag}** tarafından arşive alındı.`,
      });
    }
  },
};
