const request = require('@nudj/library/lib/request')
const toQs = require('@nudj/library/lib/toQs')

const takeFirst = (result) => result[0]
const newISODate = () => (new Date()).toISOString()

const errorHandler = (details) => (error) => {
  if (error.response.status === 404) {
    return null
  }
  console.error((new Date()).toISOString(), details, error)
  throw new StoreError({
    code: error.response.status
  })
}

module.exports = ({baseURL}) => ({
  create: ({
    type,
    data
  }) => request(`/${type}`, {
    baseURL,
    method: 'post',
    data: Object.assign(data, {
      created: newISODate(),
      modified: newISODate()
    })
  })
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
    const filterString = toQs(filters)
    let response
    if (id) {
      response = request(`/${type}/${id}`, {baseURL})
    } else {
      response = request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL}).then(takeFirst)
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
    const filterString = toQs(filters)
    return request(`/${type}${filterString.length ? `?${filterString}` : ''}`, {baseURL})
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
  }) => Promise.all(ids.map(id => request(`/${type}/${id}`, {baseURL})))
  .catch(errorHandler({
    action: 'readMany',
    baseUrl,
    type,
    id
  })),
  update: ({
    type,
    id,
    data
  }) => request(`/${type}/${id}`, {
    baseURL,
    method: 'patch',
    data: Object.assign(data, {
      modified: newISODate()
    })
  })
  .catch(errorHandler({
    action: 'update',
    baseUrl,
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
    baseUrl,
    type,
    id
  }))
})
