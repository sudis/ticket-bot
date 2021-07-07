const { GCommands } = require("gcommands");
const { Client } = require("discord.js");
const settings = require("../src/config/settings.json");
const chalk = require("chalk");
const mysql = require("mysql2");
const moment = require("moment");
const { ticketStats } = require("./functions");

const client = new Client();

client.on("ready", () => {
  let GCommandsClient = new GCommands(client, {
    cmdDir: "src/scripts/",
    eventDir: "src/events/",
    language: "turkish",
    slash: {
      slash: "both",
      prefix: "!",
    },
    defaultCooldown: "5s",
  });

  GCommandsClient.on("debug", (debug) => {
    console.log(debug);
  });
});

const con = (global.con = mysql.createConnection({
  host: settings.mysql.host,
  user: settings.mysql.user,
  password: settings.mysql.password,
  database: settings.mysql.database,
}));

con.connect((err) => {
  if (err) throw err;
  console.log(
    chalk.bgWhite.black(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`) +
      chalk.blueBright(` Successfully connected to MySQL database.`)
  );
});

client
  .login(settings.bot.token)
  .then(() => {
    console.log(
      chalk.bgWhite.black(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`) +
        chalk.blueBright(` Successfully connected to the token.`)
    );
  })
  .catch((err) => {
    console.log(
      chalk.bgWhite.black(`[${moment().format("YYYY-MM-DD HH:mm:ss")}]`) +
        chalk.redBright(` Couldn't connect to token! ${err}`)
    );
  });

client.on("ready", async () => {
  client.dispatcher.addInhibitor(
    (interaction, { message, member, guild, channel, respond, edit }) => {
      if (interaction.isButton()) {
        ticketStats("clicked_buttons", member.id, 1);
      }
    }
  );
});
