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

const errorHandler = (error) => {
  console.error((new Date()).toISOString(), error)
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
  .then(response => console.log('create', response) || response)
  .then(response => normaliseData(response.new))
  .catch(errorHandler),
  readOne: ({
    type,
    id,
    filters
  }) => {
    let response
    if (id) {
      response = request(`${baseURL}/document/${type}/${id}`)
      .then(response => console.log('one id', response) || response)
      .then(normaliseData)
    } else {
      response = request(`${baseURL}/simple/first-example`, {
        method: 'put',
        data: {
          collection: type,
          example: filters
        }
      })
      .then(response => console.log('one filtered', response) || response)
      .then(response => normaliseData(response.document))
    }
    return response.catch(errorHandler)
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
      .then(response => console.log('all filtered', response) || response)
    } else {
      response = request(`${baseURL}/simple/all`, {
        method: 'put',
        data: {
          collection: type
        }
      })
      .then(response => console.log('all', response) || response)
    }
    return response
      .then(response => response.result.map(normaliseData))
      .catch(errorHandler)
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
    .then(response => console.log('update', response) || response)
    .then(response => normaliseData(response.new))
    .catch(errorHandler)
  },
  delete: ({
    type,
    id
  }) => {
    return request(`${baseURL}/document/${type}/${id}?returnOld=true`, {
      method: 'delete'
    })
    .then(response => console.log('delete', response) || response)
    .then(response => normaliseData(response.old))
    .catch(errorHandler)
  }
})

module.exports = StoreAdaptor
