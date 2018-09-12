const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')

const schema = require('./schema')
const { sql } = require('../lib/stores')
const healthcheck = require('./routers/health-check')
const formatError = require('./lib/format-error')

module.exports = ({ transaction, sqlStore }) => {
  const app = express()
  app.use(healthcheck())
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const context = {
        web: {
          protocol: process.env.PROTOCOL,
          hostname: process.env.WEB_HOSTNAME
        },
        hire: {
          protocol: process.env.PROTOCOL,
          hostname: process.env.HIRE_HOSTNAME
        },
        userId: req.body.userId,
        transaction,
        sql: sqlStore({
          db: sql
        })
      }
      return {
        schema,
        context,
        formatError
      }
    })
  )
  return app
}
