require('envkey')

const {
  TEST_SQL_HOST,
  TEST_SQL_PORT,
  TEST_SQL_USER,
  TEST_SQL_PASS,
  TEST_SQL_NAME,
  SQL_HOST,
  SQL_PORT,
  SQL_USER,
  SQL_PASS,
  SQL_NAME
} = process.env

let connection = {
  host: TEST_SQL_HOST,
  port: TEST_SQL_PORT,
  user: TEST_SQL_USER,
  password: TEST_SQL_PASS,
  database: TEST_SQL_NAME
}

if (process.env.TARGET !== 'test') {
  connection = {
    host: SQL_HOST,
    port: SQL_PORT,
    user: SQL_USER,
    password: SQL_PASS,
    database: SQL_NAME
  }
}

module.exports = {
  client: 'mysql',
  connection,
  migrations: {
    tableName: 'migrations'
  }
}
