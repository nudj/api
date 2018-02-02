const get = require('lodash/get')
const first = require('lodash/first')
const filter = require('lodash/filter')
const toLower = require('lodash/toLower')
const flatten = require('lodash/flatten')
const uniq = require('lodash/uniq')
const axios = require('axios')
const { logThenThrow, NotFound } = require('@nudj/library/errors')
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
  if (error.constructor === NotFound) {
    logger('error', error.name, `JsonServerStore.${details.action}`, details.type, details.ids || details.filters || details.id || '', details.data || '')
    return null
  }
  logThenThrow(error,
    `JsonServerStore.${details.action}`,
    details.type,
    details.ids || details.filters || details.id || '',
    details.data || ''
  )
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
  readOne: async ({
    type,
    id,
    filters
  }) => {
    try {
      const filterString = toQs(filters)
      let result
      if (!id && !filters) return null
      if (id) {
        result = await request({
          url: `/${type}/${id}`
        })
      } else {
        result = await request({
          url: `/${type}${filterString.length ? `?${filterString}` : ''}`
        }).then(first)
      }
      return result
    } catch (error) {
      if (get(error, 'response.status') === 404) {
        return null
      }
      errorHandler({
        action: 'readOne',
        type,
        id,
        filters
      })(error)
    }
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
    if (filters.dateTo || filters.dateFrom) {
      filters.created_gte = filters.dateFrom
      filters.created_lte = filters.dateTo
      delete filters.dateFrom
      delete filters.dateTo
    }
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
    .catch(error => {
      if (error.constructor === NotFound) {
        return []
      }
      return errorHandler({
        action: 'readMany',
        type,
        ids
      })(error)
    })
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
    query,
    fields,
    filters
  }) => {
    query = toLower(query)
    const filterString = toQs(filters)
    return request({
      url: `/${type}${filterString ? `/filter?${filterString}` : ''}`
    })
    .then(response => {
      return uniq(
        flatten(
          fields.map(fieldGroup => {
            return filter(response, obj => {
              const field = fieldGroup.map(field => obj[field]).join(' ')
              return toLower(field).includes(query)
            })
          })
        )
      )
    })
    .catch(errorHandler({
      action: 'search',
      type,
      query,
      fields,
      filters
    }))
  }
})
