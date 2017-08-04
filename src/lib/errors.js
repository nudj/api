function StoreError ({
  message = 'Something went wrong',
  code = 500,
  originalError
}) {
  this.name = 'StoreError'
  this.message = message
  this.code = code
  this.originalError = originalError
}
StoreError.prototype = Object.create(Error.prototype)
StoreError.prototype.constructor = StoreError

module.exports = {
  StoreError
}
