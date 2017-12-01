const PromiseOverride = () => {
  function PromiseOverride (cb) {
    const resolve = (result) => {
      this.result = result
    }
    cb(resolve)
    return this
  }
  PromiseOverride.prototype.then = function (cb) {
    return cb(this.result)
  }
  PromiseOverride.resolve = function (value) {
    return new PromiseOverride((resolve) => resolve(value))
  }
  PromiseOverride.all = function (values) {
    return PromiseOverride.resolve(values.map(value => value && value.then ? value.result : value))
  }
  return PromiseOverride
}

module.exports = PromiseOverride
