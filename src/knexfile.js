require('envkey')

const target = process.env.TARGET
let prefix = ''
if (['test', 'staging', 'development'].includes(target)) {
  prefix = `${target.toUpperCase()}_`
}

module.exports = {
  client: 'mysql',
  connection: {
    host: process.env[`${prefix}SQL_HOST`],
    port: process.env[`${prefix}SQL_PORT`],
    user: process.env[`${prefix}SQL_USER`],
    password: process.env[`${prefix}SQL_PASS`],
    database: process.env[`${prefix}SQL_NAME`],
    charset: 'utf8mb4'
  },
  migrations: {
    tableName: 'migrations'
  }
}
