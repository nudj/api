module.exports = () => {
  class PromiseOverride {
    constructor (cb) {
      try {
        cb(this.resolve.bind(this), this.reject.bind(this))
      } catch (error) {
        this.error = error
      }
    }
    resolve (resolution) {
      this.resolution = resolution
      return this
    }
    reject (error) {
      this.error = error
      return this
    }
    then (cb) {
      try {
        if (!this.error) {
          let result = cb(this.resolution)
          if (result instanceof PromiseOverride) {
            if (result.error) throw result.error
            result = result.resolution
          }
          this.resolution = result
        }
      } catch (error) {
        this.error = error
      }
      return this
    }
    catch (cb) {
      if (this.error) {
        try {
          let result = cb(this.error)
          if (result instanceof PromiseOverride) {
            if (result.error) throw result.error
            result = result.resolution
          }
          this.resolution = result
          delete this.error
        } catch (error) {
          this.error = error
        }
      }
      return this
    }
  }
  PromiseOverride.resolve = function (value) {
    return new PromiseOverride((resolve) => resolve(value))
  }
  PromiseOverride.all = function (values) {
    return PromiseOverride.resolve(values.map(value => value && value.then ? value.resolution : value))
  }
  return PromiseOverride
}
