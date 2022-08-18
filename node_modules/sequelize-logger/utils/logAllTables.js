const { logTable } = require("./logTable")

async function logAllTables (db) {
  for (let Model of Object.values(db.models)) {
    await logTable(Model)
  }
}

module.exports = { logAllTables }
