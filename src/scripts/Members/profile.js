const { MessageEmbed } = require("discord.js");
const settings = require("../../config/settings.json")

module.exports = {
    name: "profil",
    description: "Bilet Bot'undaki ilerlemelere göz atın.",
    aliases: [],
    expectedArgs: [{
      name: "kişi",
      description: "Profiline bakacağınız kişiyi etiketleyin.",
      type: 6,
      required: true
    }],
    userRequiredRole: "",
    guildOnly: settings.bot.guildID,
    run: async({client, interaction, member, message, guild, channel, respond, edit}, args) => {
        con.query(`SELECT * FROM TicketStats WHERE member_id = '${args[0]}'`, async (err, rows) => {
          if (err) throw err;
          if (rows.length < 1) {
            con.query(`INSERT INTO TicketStats (member_id) VALUES ('${args[0]}')`)
          }
        })
  
        con.query(`SELECT * FROM Comments WHERE staff_id = '${args[0]}'`, async (err, rows) => {
          if (err) throw err;
          if (rows.length < 1) {
            con.query(`INSERT INTO Comments (staff_id, comment) VALUES ('${args[0]}','Belirtilmemiş')`)
          }
        })

      setTimeout(async () => {
        let data = await con.promise().query(`SELECT * FROM TicketStats WHERE member_id = '${args[0]}'`)
        let stars = await con.promise().query(`SELECT * FROM Comments WHERE staff_id = '${args[0]}'`)
        let embed = new MessageEmbed()
        .setAuthor(`${client.users.cache.get(args[0]).username}'nın Profili`, client.users.cache.get(args[0]).avatarURL({dynamic: true}))
        .setColor(settings.colors.claimEmbedColor)
        .setDescription(`**${client.users.cache.get(args[0]).tag}** (\`${stars[0][0].comment}\`) üyesinin Bilet İstatistikleri aşağıda yer alıyor.
        
        > Toplam **${data[0][0].clicked_buttons}** kere interaksiyona girmiş.
        > \u200B
        > Toplamda **${data[0][0].opened_tickets}** kere bilet açmış. (Genel: \`${data[0][0].general_ask}\`, Hatalar: \`${data[0][0].problem_ask}\`, Öneriler: \`${data[0][0].suggestion_ask}\`)
        > \u200B
        > Toplamda **${data[0][0].solved_tickets + data[0][0].unsolved_tickets}** kere oylanmış. (Çözülen: \`${data[0][0].solved_tickets}\`, Çözülemeyen: \`${data[0][0].unsolved_tickets}\`)
        > \u200B
        > Toplamda **${stars[0][0].staff_solubility + stars[0][0].staff_unsolubility}** puanı var. (Çözüm Puanları: \`${stars[0][0].staff_solubility}\`, Çözülemeyen Puanlar: \`${stars[0][0].staff_unsolubility}\`)
        `)
        
        respond({
          embeds: embed
        })
      }, 2000);
  }
};