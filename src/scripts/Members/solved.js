const settings = require("../../config/settings.json")
const { channelAuth, ticketStats } = require("../../functions")

module.exports = {
    name: "geri-bildirim",
    description: "Biletlerinden birisi çözüme kavuştuysa yetkiliye verilebilecek geri dönüş aracı.",
    slash: true,
    expectedArgs: [{
      name: "puanlama",
      description: "Çözümde ne kadar iyiydi? (5 ve 4 Çok İyi, 3 İyi, 2 ve 1 Kötü)",
      type: 3,
      required: true,
      choices: [{
        name: "★★★★★",
        value: "5"
      }, {
        name: "★★★★",
        value: "4"
      }, {
        name: "★★★",
        value: "3"
      }, {
        name: "★★",
        value: "-2"
      }, {
        name: "★",
        value: "-1"
      }]
    }, {
      name: "açıklama",
      description: "Yorumunuz nedir?",
      type: 3,
      required: true,
      choices: [{
        name: "Konuda çok bilgiliydi. Sorumu sorduğum anda cevap aldım.",
        value: "Akıllı"
      }, {
        name: "Beni gerekli birimlerle konuşturarak sorunumu çözdü.",
        value: "Hızlı"
      }, {
        name: "Sorunumun cevabını bilmese de bana yardımcı olarak sorunu çözdük.",
        value: "Arkadaşça"
      }, {
        name: "Bileti devralan kişi benimle dalga geçer gibi konuştu.",
        value: "Dalgacı"
      }, {
        name: "Bileti devralan kişi konuya hiç hakim değildi.",
        value: "Bilgisiz"
      }, {
        name: "Benim biletimle fazla ilgilenmedi, başından göndermeye çalıştı.",
        value: "Kötü Hız"
      }]
    }],
    guildOnly: settings.bot.guildID,
    run: async({client, interaction, member, message, guild, channel, respond, edit}, args) => {
      if (channelAuth(channel) == null) return respond({
        content: `${settings.ticketSettings.ticketFeelings.whatEmoji} Bu komutu kullanabilmek için bilet kanallarından birisinde olmak zorundasın.`,
        ephemeral: true
      })

      let data = await con.promise().query(`SELECT * FROM Tickets WHERE pid = '${channelAuth(channel)}'`)

      if (data[0][0].claimed_staff == null) respond({
        content: `${settings.ticketSettings.ticketFeelings.whatEmoji} Çözüldü eylemini verebilmek için bu biletin bir yetkili tarafından devralınması gerekiyor.`,
        ephemeral: true
      })

      let number = parseInt(args[0])
      if (number >= 3) {
        if (args[1] == "Dalgacı" || args[1] == "Bilgisiz" || args[1] == "Kötü Hız") return respond({
          content: `${settings.ticketSettings.ticketFeelings.whatEmoji} Yetkiliye ${args[0]} yıldız verdin fakat yorum seçimin 1 veya 2 yıldıza uyuyor. Yorumunu yıldızınla aynı düzleme koymalısın.`
        })

        ticketStats("solved_tickets", member.id, 1)

        con.query(`SELECT * FROM Comments WHERE staff_id = '${data[0][0].claimed_staff}'`, async (err, rows) => {
          if (err) throw err;
          if (rows.length < 1) {
            con.query(`INSERT INTO Comments (staff_id, staff_solubility, comment) VALUES ('${data[0][0].claimed_staff}','${number}','${args[1]}')`)
          } else {
            con.query(`UPDATE Comments SET staff_solubility = ${rows[0].staff_solubility} + ${number}, comment = '${args[1]}' WHERE staff_id = '${data[0][0].claimed_staff}'`)
          }
        })

        respond({
          content: `${settings.ticketSettings.ticketFeelings.upvoteEmoji} Geri bildirim başarılı. **${client.users.cache.get(data[0][0].claimed_staff).tag}** yetkilisine **${number}** puan verdin.`,
          ephemeral: true
        })
      } else {
        if (args[1] == "Akıllı" || args[1] == "Hızlı" || args[1] == "Arkadaşça") return respond({
          content: `${settings.ticketSettings.ticketFeelings.whatEmoji} Yetkiliye ${args[0]} yıldız verdin fakat yorum seçimin 5, 4 veya 3 yıldıza uyuyor. Yorumunu yıldızınla aynı düzleme koymalısın.`
        })

        ticketStats("unsolved_tickets", member.id, 1)

        con.query(`SELECT * FROM Comments WHERE staff_id = '${data[0][0].claimed_staff}'`, async (err, rows) => {
          if (err) throw err;
          if (rows.length < 1) {
            con.query(`INSERT INTO Comments (staff_id, staff_unsolubility, comment) VALUES ('${data[0][0].claimed_staff}','${number}','${args[1]}')`)
          } else {
            con.query(`UPDATE Comments SET staff_unsolubility = ${rows[0].staff_unsolubility} + ${number}, comment = '${args[1]}' WHERE staff_id = '${data[0][0].claimed_staff}'`)
          }
        })

        respond({
          content: `${settings.ticketSettings.ticketFeelings.donwvoteEmoji} Geri bildirim başarılı. **${client.users.cache.get(data[0][0].claimed_staff).tag}** yetkilisine **${number}** puan verdin.`,
          ephemeral: true
        })
      }
  }
};