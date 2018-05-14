const NUDJ = 'NUDJ'
const DB_URL = `http://${process.env.DB_HOST}:${process.env.DB_PORT}`
const NO_SQL_URL = `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}`
const INTERNAL_EMAIL_ADDRESS = 'hello@nudj.co'

module.exports = {
  NUDJ,
  DB_URL,
  NO_SQL_URL,
  INTERNAL_EMAIL_ADDRESS
}
