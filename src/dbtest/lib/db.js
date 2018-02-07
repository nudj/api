const { Database } = require('arangojs')

const db = new Database({
  url: 'http://db:8529'
})

module.exports = db
