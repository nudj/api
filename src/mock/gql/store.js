const request = require('@nudj/library/lib/request')

const toQs = (filters = {}) => {
  return Object.keys(filters).map((key) => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`
  }).join('&')
}

const takeFirst = (result) => result[0]
const newISODate = () => (new Date()).toISOString()

module.exports = {
  create: ({
    type,
    data
  }) => request(`/${type}`, {
    method: 'post',
    data: Object.assign(data, {
      created: newISODate(),
      modified: newISODate()
    })
  }),
  readOne: ({
    type,
    id,
    filters
  }) => {
    let filterString = toQs(filters)
    return id ? request(`/${type}/${id}`) : request(`/${type}${filterString.length ? `?${filterString}` : ''}`).then(takeFirst)
  },
  readAll: ({
    type,
    filters
  }) => {
    let filterString = toQs(filters)
    return request(`/${type}${filterString.length ? `?${filterString}` : ''}`)
  },
  readMany: ({
    type,
    ids
  }) => Promise.all(ids.map(id => request(`/${type}/${id}`))),
  update: ({
    type,
    id,
    data
  }) => request(`/${type}/${id}`, {
    method: 'patch',
    data: Object.assign(data, {
      modified: newISODate()
    })
  }),
  delete: ({
    type,
    id
  }) => request(`/${type}/${id}`).then(item => request(`/${type}/${id}`, {
    method: 'delete'
  }).then(() => item))
}
