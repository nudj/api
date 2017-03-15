let fetch = require('node-fetch')
let omit = require('lodash/omit')
let reduce = require('lodash/reduce')

let StoreError = require('./errors').StoreError

function extractJson (response) {
  return Promise.resolve(response.json())
}

function normalise (data) {
  if (data.error) {
    return {
      error: true,
      message: data.errorMessage,
      code: data.code
    }
  }
  return Object.assign({
    id: data.document._key
  }, omit(data.document, [
    '_key',
    '_id',
    '_rev'
  ]))
}

function handleError (error) {
  return Promise.reject(new StoreError(error.message, error.code, error))
}

function denormalise (data) {
  return reduce(data, (result, value, key) => {
    if (key === 'id') {
      result._key = value
    } else {
      result[key] = value
    }
    return result
  }, {})
}

module.exports = {
  getOne: (type, filters) => {
    return fetch(`http://db:8529/_api/simple/first-example`, {
      method: 'PUT',
      body: JSON.stringify({
        collection: type,
        example: denormalise(filters)
      })
    })
    .then(extractJson)
    .then(normalise)
    .catch(handleError)
  }
}
