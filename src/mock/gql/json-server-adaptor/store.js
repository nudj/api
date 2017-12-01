const request = require('@nudj/library/lib/request')
const toQs = require('@nudj/library/lib/to-qs')
const logger = require('@nudj/library/lib/logger')
const merge = require('@nudj/library/lib/merge')

const StoreError = require('../../../lib/errors').StoreError

const takeFirst = (result) => result[0]
const newISODate = () => (new Date()).toISOString()

const errorHandler = (details) => (error) => {
  console.log(error.message)
  const code = error.status || (error.response && error.response.status) || 500
  if (code === 404) {
    return null
  }
  logger('error', (new Date()).toISOString(), details, error)
  throw new StoreError({ code })
}
const baseURL = process.env.DB_API_URL

module.exports = () => ({
  create: ({
    type,
    data
  }) => request(`/${type}`, {
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
  })),
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
      response = request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL}).then(takeFirst)
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
      const filterString = toQs(filters)
      const matches = await request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL})
      let item = takeFirst(matches)
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
  }) => Promise.all(ids.map(id => request(`/${type}/${id}`, {baseURL})))
  .catch(errorHandler({
    action: 'readMany',
    type,
    ids
  })),
  update: ({
    type,
    id,
    data
  }) => request(`/${type}/${id}`, {
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
  })),
  delete: ({
    type,
    id
  }) => request(`/${type}/${id}`).then(item => request(`/${type}/${id}`, {
    baseURL,
    method: 'delete'
  })
  .then(() => item))
  .catch(errorHandler({
    action: 'delete',
    type,
    id
  }))
})
