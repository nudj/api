const nodeFetch = require('node-fetch')
const format = require('date-fns/format')
const reduce = require('lodash/reduce')
const logger = require('@nudj/library/lib/logger')

const StoreError = require('../lib/errors').StoreError
const authHash = new Buffer(process.env.DB_USER + ':' + process.env.DB_PASS).toString('base64')

function fetch ({ path, options }) {
  path = `http://db:8529/_db/nudj/_api/${path}`
  options = Object.assign(
    options,
    {
      headers: {
        'Authorization': 'Basic ' + authHash
      },
      body: Object.assign({}, options.body, {
        skip: 0,
        batchSize: 1000
      })
    }
  )
  return Promise.all([
    makeRequest({ path, options })
  ])
  .then(checkForMore({ path, options }))
}

function makeRequest ({ path, options }) {
  options = Object.assign({}, options, {
    body: JSON.stringify(options.body)
  })
  return nodeFetch(path, options)
  .then(response => response.json())
}

function checkForMore ({ path, options }) {
  return async (responses) => {
    const latest = responses[responses.length - 1]
    if (latest.hasMore) {
      options = Object.assign({}, options, {
        body: Object.assign({}, options.body, {
          skip: options.body.skip + 1000
        })
      })
      const response = makeRequest({ path, options })
      return Promise.all(responses.concat(response))
      .then(checkForMore({ path, options }))
    }
    return responses
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

function extractData ({ responseKey }) {
  return responses => {
    return responses.reduce((result, response) => {
      if (result && result.error) {
        return result
      }
      if (response.error) {
        return Promise.resolve({
          error: true,
          errorMessage: response.errorMessage,
          code: response.code
        })
      }
      return result ? result.concat(response[responseKey]) : response[responseKey]
    }, null)
  }
}

function normalise (data) {
  if (Array.isArray(data)) {
    return data.map(normaliseData)
  }
  return normaliseData(data)
}

function handleError ({ uri, options }) {
  return (error) => {
    const storeError = new StoreError({
      message: error.message,
      code: error.code,
      originalError: error
    })
    logger('info', (new Date()).toISOString(), 'ERROR', uri, options)
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
  const path = 'simple/all'
  const options = {
    method: 'PUT',
    body: {
      collection: type
    }
  }
  const responseKey = 'result'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

function getFiltered (type, filters) {
  const path = 'simple/by-example'
  const options = {
    method: 'PUT',
    body: {
      collection: type,
      example: denormalise(filters)
    }
  }
  const responseKey = 'result'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

function getOne (type, filters) {
  const path = 'simple/first-example'
  const options = {
    method: 'PUT',
    body: {
      collection: type,
      example: denormalise(filters)
    }
  }
  const responseKey = 'document'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

function post (type, props) {
  const path = `document/${type}?returnNew=true`
  const options = {
    method: 'POST',
    body: addDateTimes(props, true)
  }
  const responseKey = 'new'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

function del (type, id) {
  const path = `document/${type}/${id}?returnOld=true`
  const options = {
    method: 'DELETE'
  }
  const responseKey = 'old'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

function patch (type, id, props) {
  const path = `document/${type}/${id}?returnNew=true`
  const options = {
    method: 'PATCH',
    body: addDateTimes(props)
  }
  const responseKey = 'new'
  return fetch({ path, options })
  .then(extractData({ responseKey }))
  .then(normalise)
  .catch(handleError({ path, options }))
}

module.exports = {
  getAll,
  getFiltered,
  getOne,
  post,
  patch,
  del
}
