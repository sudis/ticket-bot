/**
 * Bilet hakkında bilgilendirme sağlar.
 * @param {ChannelType} button Buton'un kanalı belirtilmeli.
 * @returns Number
 */
function channelAuth(button) {
  let result =
    button.name.split("ticket-claimed-")[1] ||
    button.name.split("ticket-closed-")[1] ||
    button.name.split("ticket-archived-")[1] ||
    button.name.split("ticket-")[1];
  if (!result) {
    return null;
  } else {
    return result;
  }
}

/**
 * Biletlere kolayca istatistik eklemek için.
 * @param {String} type Tip belirleyin. Örn: opened_tickets, solved_tickets, unsolved_tickets, general_ask, problem_ask, suggestion_ask
 * @param {String} member_id Üyeyi belirleyin.
 * @param {Number} amount Miktarı belirleyin.
 */
function ticketStats(type, member_id, amount) {
  if (type === "opened_tickets") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, opened_tickets) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET opened_tickets = ${rows[0].opened_tickets} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "solved_tickets") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, solved_tickets) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET solved_tickets = ${rows[0].solved_tickets} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "unsolved_tickets") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, unsolved_tickets) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET unsolved_tickets = ${rows[0].unsolved_tickets} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "general_ask") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, general_ask) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET general_ask = ${rows[0].general_ask} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "problem_ask") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, problem_ask) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET problem_ask = ${rows[0].problem_ask} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "suggestion_ask") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
          con.query(
            `INSERT INTO TicketStats (member_id, suggestion_ask) VALUES ('${member_id}','${amount}')`
          );
        } else {
          con.query(
            `UPDATE TicketStats SET suggestion_ask = ${rows[0].suggestion_ask} + ${amount}`
          );
        }
      }
    );
  }

  if (type === "clicked_buttons") {
    con.query(
      `SELECT * FROM TicketStats WHERE member_id = '${member_id}'`,
      async (err, rows) => {
        if (err) throw err;
        if (rows.length < 1) {
        } else {
          con.query(
            `UPDATE TicketStats SET clicked_buttons = ${rows[0].clicked_buttons} + ${amount}`
          );
        }
      }
    );
  }
}

module.exports.channelAuth = channelAuth;
module.exports.ticketStats = ticketStats;
