const libRequest = require('@nudj/library/lib/request')
const { merge } = require('@nudj/library')
const reduce = require('lodash/reduce')
const StoreError = require('../lib/errors').StoreError

const newISODate = () => (new Date()).toISOString()
const authHash = new Buffer(process.env.DB_USER + ':' + process.env.DB_PASS).toString('base64')
const request = (uri, options = {}) => libRequest(uri, merge({
  headers: {
    'Authorization': 'Basic ' + authHash
  }
}, options))

const errorHandler = (details) => (error) => {
  if (error.response.status === 404) {
    return null
  }
  console.error((new Date()).toISOString(), details, error)
  throw new StoreError({
    code: error.response.status
  })
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

const StoreAdaptor = ({
  baseURL
}) => ({
  create: ({
    type,
    data
  }) => request(`${baseURL}/document/${type}?returnNew=true`, {
    method: 'post',
    data: Object.assign({
      created: newISODate(),
      modified: newISODate()
    }, data)
  })
  .then(response => normaliseData(response.new))
  .catch(errorHandler({
    action: 'create',
    baseUrl,
    type,
    data
  })),
  readOne: ({
    type,
    id,
    filters
  }) => {
    let response
    if (id) {
      response = request(`${baseURL}/document/${type}/${id}`)
      .then(normaliseData)
    } else {
      response = request(`${baseURL}/simple/first-example`, {
        method: 'put',
        data: {
          collection: type,
          example: filters
        }
      })
      .then(response => normaliseData(response.document))
    }
    return response.catch(errorHandler({
      action: 'readOne',
      baseUrl,
      type,
      id,
      filters
    }))
  },
  readAll: ({
    type,
    filters
  }) => {
    let response
    if (filters) {
      response = request(`${baseURL}/simple/by-example`, {
        method: 'put',
        data: {
          collection: type,
          example: filters
        }
      })
    } else {
      response = request(`${baseURL}/simple/all`, {
        method: 'put',
        data: {
          collection: type
        }
      })
    }
    return response
      .then(response => response.result.map(normaliseData))
      .catch(errorHandler({
        action: 'readAll',
        baseUrl,
        type,
        filters
      }))
  },
  readMany: ({
    type,
    ids
  }) => {
    return Promise.all(ids.map(id => request(`${baseURL}/document/${type}/${id}`)))
      .then(response => response.map(normaliseData))
      .catch(errorHandler({
        action: 'readMany',
        baseUrl,
        type,
        id
      }))
  },
  update: ({
    type,
    id,
    data
  }) => {
    return request(`${baseURL}/document/${type}/${id}?returnNew=true`, {
      method: 'patch',
      data: Object.assign({
        modified: newISODate()
      }, data)
    })
    .then(response => normaliseData(response.new))
    .catch(errorHandler({
      action: 'update',
      baseUrl,
      type,
      id,
      data
    }))
  },
  delete: ({
    type,
    id
  }) => {
    return request(`${baseURL}/document/${type}/${id}?returnOld=true`, {
      method: 'delete'
    })
    .then(response => normaliseData(response.old))
    .catch(errorHandler({
      action: 'delete',
      baseUrl,
      type,
      id
    }))
  }
})

module.exports = StoreAdaptor
