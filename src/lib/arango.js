let nodeFetch = require('node-fetch')
let reduce = require('lodash/reduce')

let StoreError = require('./errors').StoreError

function fetch (path, options) {
  return nodeFetch(`http://db:8529/_api/${path}`, options)
    .then(extractJson)
    .catch(handleError)
}

function extractJson (response) {
  return Promise.resolve(response.json())
}

function normalise (responseKey) {
  return (data) => {
    if (data.error) {
      return Promise.resolve({
        error: true,
        errorMessage: data.errorMessage,
        code: data.code
      })
    }
    return reduce(data[responseKey], (result, value, key) => {
      switch (key) {
        case '_key':
          result.id = value
          break
        case '_id':
        case '_rev':
          break
        default:
          result[key] = value
      }
      return result
    }, {})
  }
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

function getOne (type, filters) {
  return fetch('simple/first-example', {
    method: 'PUT',
    body: JSON.stringify({
      collection: type,
      example: denormalise(filters)
    })
  })
  .then(normalise('document'))
}

function createUnique (type, props) {
  return getOne(type, props)
  .then((data) => {
    if (data.code === 404) {
      return fetch(`document/${type}?returnNew=true`, {
        method: 'POST',
        body: JSON.stringify(props)
      })
      .then(normalise('new'))
    } else {
      return Promise.resolve({
        error: true,
        errorMessage: 'already exists',
        code: 409,
        document: data
      })
    }
  })
}

module.exports = {
  getOne,
  createUnique
}
