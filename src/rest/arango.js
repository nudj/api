let nodeFetch = require('node-fetch')
let format = require('date-fns/format')
let reduce = require('lodash/reduce')

let StoreError = require('../lib/errors').StoreError
let authHash = new Buffer(process.env.DB_USER + ':' + process.env.DB_PASS).toString('base64')

function fetch (path, options) {
  const uri = `http://db:8529/_db/nudj/_api/${path}`
  console.log((new Date()).toISOString(), 'REQUEST', uri, options)
  return nodeFetch(uri, Object.assign(options, {
    headers: {
      'Authorization': 'Basic ' + authHash
    }
  }))
  .then(extractJson({ uri, options }))
  .catch(handleError({ uri, options }))
}

function extractJson ({ uri, options }) {
  return (response) => {
    const json = response.json()
    console.log((new Date()).toISOString(), 'RESPONSE', uri, options, json)
    return Promise.resolve(json)
  }
}

function normaliseData (data) {
  return reduce(data, (result, value, key) => {
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

function normalise (responseKey) {
  return (data) => {
    if (data.error) {
      return Promise.resolve({
        error: true,
        errorMessage: data.errorMessage,
        code: data.code
      })
    }

    const parent = data[responseKey]

    if (Array.isArray(parent)) {
      return parent.map(normaliseData)
    }

    return normaliseData(parent)
  }
}

function handleError ({ uri, options }) {
  return (error) => {
    const storeError = new StoreError({
      message: error.message,
      code: error.code,
      originalError: error
    })
    console.log((new Date()).toISOString(), 'ERROR', uri, options)
    return Promise.reject(storeError)
  }
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

function addDateTimes (data, addCreated) {
  let datetime = format(new Date())
  if (addCreated) {
    data.created = datetime
  }
  data.modified = datetime
  return data
}

function getAll (type) {
  return fetch('simple/all', {
    method: 'PUT',
    body: JSON.stringify({
      collection: type
    })
  })
  .then(normalise('result'))
}

function getFiltered (type, filters) {
  return fetch('simple/by-example', {
    method: 'PUT',
    body: JSON.stringify({
      collection: type,
      example: denormalise(filters)
    })
  })
  .then(normalise('result'))
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
        body: JSON.stringify(addDateTimes(props, true))
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

function patch (type, id, props) {
  return fetch(`document/${type}/${id}?returnNew=true`, {
    method: 'PATCH',
    body: JSON.stringify(addDateTimes(props))
  })
  .then(normalise('new'))
}

module.exports = {
  getAll,
  getFiltered,
  getOne,
  createUnique,
  patch
}
