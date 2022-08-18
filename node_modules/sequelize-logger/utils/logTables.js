const { Sequelize } = require('sequelize')
const { logTable } = require('./logTable')

async function logTables () {

  if (arguments.length === 1) return void logTable(arguments[0])

  const args = [...arguments]
  const lastArg = args.at(-1)

  if (lastArg instanceof Sequelize) {
    for (let model of args.slice(0, -1)) {
      await logTable(model, lastArg)
    }
  } else {
    for (let model of args) {
      await logTable(model)
    }
  }

}

module.exports = { logTables }
