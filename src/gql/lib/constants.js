const slugGenerators = require('./helpers/slug-generators')

const NUDJ = 'NUDJ'
const DB_URL = `http://${process.env.DB_HOST}:${process.env.DB_PORT}`
const NO_SQL_URL = `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}`
const INTERNAL_EMAIL_ADDRESS = 'hello@nudj.co'
const DUMMY_APPLICANT_EMAIL_ADDRESS = 'hello+applicant@nudj.co'
const INTERNAL_EMAIL_FROM = `nudj <${INTERNAL_EMAIL_ADDRESS}>`

const SLUG_GENERATORS = {
  companies: slugGenerators.field('name'),
  jobs: slugGenerators.field('title'),
  surveys: slugGenerators.field('introTitle'),
  accessRequests: slugGenerators.random
}

module.exports = {
  NUDJ,
  DB_URL,
  NO_SQL_URL,
  INTERNAL_EMAIL_ADDRESS,
  INTERNAL_EMAIL_FROM,
  SLUG_GENERATORS,
  DUMMY_APPLICANT_EMAIL_ADDRESS
}
