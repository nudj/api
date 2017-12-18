const first = require('lodash/first')
const filter = require('lodash/filter')
const axios = require('axios')
const { NotFound } = require('@nudj/library/errors')
const {
  toQs,
  logger,
  merge
} = require('@nudj/library')

const newISODate = () => (new Date()).toISOString()

const request = (options = {}) => {
  return axios(Object.assign({
    baseURL: 'http://localhost:81'
  }, options))
  .then(response => response.data)
}

const errorHandler = (details) => (error) => {
  const code = error.status || (error.response && error.response.status) || 500
  if (code === 404) {
    return null
  }
  logger('error', (new Date()).toISOString(), details, error)
  throw error
}

module.exports = () => ({
  create: ({
    type,
    data
  }) => {
    return request({
      url: `/${type}`,
      method: 'post',
      data: merge(data, {
        created: newISODate(),
        modified: newISODate()
      })
    })
    .catch(errorHandler({
      action: 'create',
      type,
      data
    }))
  },
  readOne: ({
    type,
    id,
    filters
  }) => {
    const filterString = toQs(filters)
    let response
    if (id) {
      response = request({
        url: `/${type}/${id}`
      })
    } else {
      response = request({
        url: `/${type}${filterString.length ? `?${filterString}` : ''}`
      })
      .then(first)
    }
    return response
    .then(result => {
      if (!result) throw new NotFound('Item not found')
      return result
    })
    .catch(errorHandler({
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
      const filterString = toQs(filters)
      const matches = await request({
        url: `/${type}${filterString.length ? `?${filterString}` : ''}`
      })
      let item = first(matches)
      if (!item) {
        item = await request({
          url: `/${type}`,
          method: 'post',
          data: merge(data, {
            created: newISODate(),
            modified: newISODate()
          })
        })
      }
      return item
    } catch (error) {
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
    const filterString = toQs(filters)
    return request({
      url: `/${type}${filterString.length ? `?${filterString}` : ''}`
    })
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
    return Promise.all(ids.map(id => request({
      url: `/${type}/${id}`
    })))
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
    return request({
      url: `/${type}/${id}`,
      method: 'patch',
      data: merge(data, {
        modified: newISODate()
      })
    })
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
    return request({
      url: `/${type}/${id}`
    })
    .then(item => {
      return request({
        url: `/${type}/${id}`,
        method: 'delete'
      })
      .then(() => item)
    })
    .catch(errorHandler({
      action: 'delete',
      type,
      id
    }))
  },
  search: ({
    type,
    query
  }) => {
    return request({ url: `/${type}` })
      .then(response => {
        return filter(response, (connection) => {
          const name = [connection.firstName, connection.lastName].join(' ')
          return name.includes(query)
        })
      })
    .catch(errorHandler({
      action: 'search',
      type,
      query
    }))
  }
})
