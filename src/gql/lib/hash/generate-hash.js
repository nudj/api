const crypto = require('crypto')
const createHash = require('hash-generator')

const generateHash = (input = createHash(16)) => crypto
  .createHash('md5')
  .update(input)
  .digest('hex')

module.exports = generateHash
