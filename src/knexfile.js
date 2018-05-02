require('envkey')

const {
  SQL_HOST,
  SQL_PORT,
  SQL_USER,
  SQL_PASS,
  SQL_NAME
} = process.env

module.exports = {
  client: 'mysql',
  connection: {
    host: SQL_HOST,
    port: SQL_PORT,
    user: SQL_USER,
    password: SQL_PASS,
    database: SQL_NAME
  },
  migrations: {
    tableName: 'migrations'
  }
}
