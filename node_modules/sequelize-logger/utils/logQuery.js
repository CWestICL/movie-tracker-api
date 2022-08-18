async function logQuery (query, { text = null, table = true } = {}) {
  let allData = await query
  allData = Array.isArray(allData) ? allData : [allData]
  console.log(`${text || 'Query ' + Date.now()}:`)
  if (table) {
    console.table(allData.map(d => d.toJSON()))
  } else {
    for (let d of allData) {
      console.log(d.toJSON(), '\n')
    }
  }
}

module.exports = { logQuery }
