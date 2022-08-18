const { Sequelize } = require('sequelize')

async function logTable (model, db) { 
  const isString = typeof model === 'string'

  if (isString && !(db instanceof Sequelize)) {
    console.warn('Sequlize Logger: Sequelize instance is required when logging a table referred to by model name.')
    return
  }

  model = isString ? db.model(model) : model
  const allData = await model.findAll()
  console.log(model.name + ':')
  console.table(allData.map(d => d.toJSON()))
}

module.exports = { logTable }
