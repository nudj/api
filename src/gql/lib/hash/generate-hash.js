const crypto = require('crypto')

const generateHash = (input) => crypto
  .createHash('md5')
  .update(input || crypto.randomBytes(20).toString('hex'))
  .digest('hex')

module.exports = generateHash
