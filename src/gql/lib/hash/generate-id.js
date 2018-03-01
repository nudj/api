const generateHash = require('./generate-hash')

const generateId = (type, object) => {
  if (!type && !object) return generateHash()

  switch (type) {
    case 'company':
    case 'role':
      if (!object.name) throw new Error(`Invalid ${type}`)
      return generateHash(object.name)
    case 'person':
      if (!object.email) throw new Error(`Invalid ${type}`)
      return generateHash(object.email)
    default:
      throw new Error(`Unrecognised type: ${type}`)
  }
}

module.exports = generateId
