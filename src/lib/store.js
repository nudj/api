let fetch = require('node-fetch')
let omit = require('lodash/omit')

function normalise (data) {
  return Object.assign({
    id: data._key
  }, omit(data, [
    '_key',
    '_id',
    '_rev'
  ]))
}

module.exports = {
  getOne: (type, filters) => {
    return fetch(`http://db:8529/_api/document/${type}/${filters.id}`).then(normalise)
  }
}
