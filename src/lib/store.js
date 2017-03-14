let fetch = require('node-fetch')

module.exports = {
  getOne: (type, filters) => {
    return fetch(`http://db:8529/_api/document/${type}/${filters.id}`)
  }
}
