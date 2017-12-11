const first = require('lodash/first')
const request = require('@nudj/library/lib/request')
const { NotFound } = require('@nudj/library/errors')
const {
  toQs,
  logger,
  merge
} = require('@nudj/library')

const newISODate = () => (new Date()).toISOString()

const errorHandler = (details) => (error) => {
  const code = error.status || (error.response && error.response.status) || 500
  if (code === 404) {
    return null
  }
  logger('error', (new Date()).toISOString(), details, ...error.log)
  throw error
}
const baseURL = process.env.DB_API_URL

module.exports = () => ({
  create: ({
    type,
    data
  }) => {
    return request(`/${type}`, {
      baseURL,
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
      response = request(`/${type}/${id}`, {baseURL})
    } else {
      response = request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL}).then(first)
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
      const matches = await request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL})
      let item = first(matches)
      if (!item) {
        item = await request(`/${type}`, {
          baseURL,
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
    return request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL})
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
    return Promise.all(ids.map(id => request(`/${type}/${id}`, {baseURL})))
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
    return request(`/${type}/${id}`, {
      baseURL,
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
    return request(`/${type}/${id}`)
    .then(item => request(`/${type}/${id}`, {
      baseURL,
      method: 'delete'
    })
    .then(() => item))
    .catch(errorHandler({
      action: 'delete',
      type,
      id
    }))
  }
})
