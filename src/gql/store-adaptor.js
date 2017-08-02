const request = require('@nudj/library/lib/request')
let StoreError = require('../lib/errors').StoreError

const newISODate = () => (new Date()).toISOString()

const StoreAdaptor = ({
  baseURL
}) => ({
  create: ({
    type,
    data
  }) => request(`${baseURL}document/${type}?returnNew=true`, {
    method: 'post',
    data: Object.assign({
      created: newISODate(),
      modified: newISODate()
    }, data)
  })
  .then(response => response.new)
  .catch(error => {
    console.error((new Date()).toISOString(), error)
    throw new StoreError({
      code: error.response.status
    })
  })
})

module.exports = StoreAdaptor
