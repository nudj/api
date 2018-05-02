const OLD_DB_URL = `http://${process.env.DB_HOST}:${process.env.DB_PORT}`
const NO_SQL_URL = `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}`

module.exports = {
  OLD_DB_URL,
  NO_SQL_URL
}
