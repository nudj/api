const libRequest = require('@nudj/library/lib/request')
const { logger, merge } = require('@nudj/library')
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
  const code = error.status || (error.response && error.response.status) || 500
  if (code === 404) {
    return null
  }
  logger('error', (new Date()).toISOString(), details, error)
  throw new StoreError({ code })
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
      type,
      id,
      filters
    }))
  },
  readOneOrCreate: async ({
    type,
    filters,
    data
  }) => {
    try {
      let item = await request(`${baseURL}/simple/first-example`, {
        method: 'put',
        data: {
          collection: type,
          example: filters
        }
      })
      return normaliseData(item)
    } catch (error) {
      try {
        if ((error.status || (error.response && error.response.status)) === 404) {
          const item = await request(`${baseURL}/document/${type}?returnNew=true`, {
            method: 'post',
            data: Object.assign({
              created: newISODate(),
              modified: newISODate()
            }, data)
          })
          return normaliseData(item)
        }
      } catch (error) {
        return errorHandler({
          action: 'readOneOrCreate',
          type,
          filters,
          data
        })(error)
      }
      return errorHandler({
        action: 'readOneOrCreate',
        type,
        filters,
        data
      })(error)
    }
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
        type,
        ids
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
      type,
      id
    }))
  }
})

module.exports = StoreAdaptor
