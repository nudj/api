const Promise = () => {
  function Promise (cb) {
    const resolve = (result) => {
      this.result = result
    }
    cb(resolve)
    return this
  }
  Promise.prototype.then = function (cb) {
    return cb(this.result)
  }
  Promise.resolve = function (value) {
    return new Promise((resolve) => resolve(value))
  }
  Promise.all = function (values) {
    return Promise.resolve(values.map(value => value && value.then ? value.result : value))
  }
  return Promise
}

module.exports = (store, action) => {
  if (!store) {
    throw new Error('No store supplied')
  }
  if (!action) {
    throw new Error('No action supplied')
  }
  return `function (params) {
    const Promise = (${Promise.toString()})()
    const store = ${store.toString()}
    const action = ${action.toString()}
    return action(store(), params).then(data => data)
  }`
}
