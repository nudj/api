let fetch = require('node-fetch')
let omit = require('lodash/omit')

let StoreError = require('./errors').StoreError

function extractData (response) {
  return Promise.resolve(response.json())
}

function normaliseData (data) {
  if (data.error) {
    return {
      error: true,
      message: data.errorMessage,
      code: data.code
    }
  }
  return Object.assign({
    id: data._key
  }, omit(data, [
    '_key',
    '_id',
    '_rev'
  ]))
}

function normaliseError (error) {
  return Promise.reject(new StoreError(error.message, error.code, error))
}

module.exports = {
  getOne: (type, filters) => {
    return fetch(`http://db:8529/_api/document/${type}/${filters.id}`)
      .then(extractData)
      .then(normaliseData)
      .catch(normaliseError)
  }
}
