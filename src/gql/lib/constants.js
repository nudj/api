const kebabCase = require('lodash/kebabCase')
const hash = require('hash-generator')

const NUDJ = 'NUDJ'
const DB_URL = `http://${process.env.DB_HOST}:${process.env.DB_PORT}`
const NO_SQL_URL = `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}`
const INTERNAL_EMAIL_ADDRESS = 'hello@nudj.co'

const fieldSlugGenerator = field => (data, addRandom) => {
  let random = ''
  if (addRandom) {
    random = `-${hash(8)}`
  }
  return kebabCase(data[field]) + random
}

const SLUG_GENERATORS = {
  companies: fieldSlugGenerator('name'),
  jobs: fieldSlugGenerator('title'),
  surveys: fieldSlugGenerator('introTitle')
}

module.exports = {
  NUDJ,
  DB_URL,
  NO_SQL_URL,
  INTERNAL_EMAIL_ADDRESS,
  SLUG_GENERATORS
}
