const crypto = require('crypto')
const createHash = require('hash-generator')

const generateHash = (input = createHash(8)) => crypto
  .createHash('md5')
  .update(input)
  .digest('hex')

const generateId = (type, object) => {
  switch (type) {
    case 'company':
    case 'role':
      if (!object.name) throw new Error(`Invalid ${type}`)
      return generateHash(object.name)
    case 'person':
      if (!object.email) throw new Error(`Invalid ${type}`)
      return generateHash(object.email)
    case 'connection':
      if (!object.email || !object.from) throw new Error(`Invalid ${type}`)
      return generateHash(`${object.email}.${object.from}`)
    default:
      return generateHash()
  }
}

module.exports = generateId
