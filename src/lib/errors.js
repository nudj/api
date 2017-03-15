function StoreError (message, code, originalError) {
  this.name = 'StoreError'
  this.message = message || 'Default Message'
  this.code = code
  this.originalError = originalError
}
StoreError.prototype = Object.create(Error.prototype)
StoreError.prototype.constructor = StoreError

module.exports = {
  StoreError
}
