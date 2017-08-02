const request = require('@nudj/library/lib/request')
let StoreError = require('../lib/errors').StoreError

const newISODate = () => (new Date()).toISOString()

const errorHandler = (error) => {
  console.error((new Date()).toISOString(), error)
  throw new StoreError({
    code: error.response.status
  })
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
  .then(response => response.new)
  .catch(errorHandler),
  readOne: ({
    type,
    id,
    filters
  }) => {
    let response
    if (id) {
      response = request(`${baseURL}/document/${type}/${id}`)
    } else {
      response = request(`${baseURL}/simple/first-example`, {
        method: 'put',
        data: {
          collection: type,
          example: filters
        }
      })
      .then(response => response.document)
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
    } else {
      response = request(`${baseURL}/simple/all`, {
        method: 'put',
        data: {
          collection: type
        }
      })
    }
    return response
      .then(response => response.result)
      .catch(errorHandler)
  }
})

module.exports = StoreAdaptor
