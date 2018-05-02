const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')

const schema = require('./schema')
const {
  sql,
  nosql
} = require('../lib/stores')

module.exports = ({ transaction, sqlStore, nosqlStore }) => {
  const app = express()
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const context = {
        web: {
          protocol: req.protocol,
          hostname: process.env.WEB_HOSTNAME
        },
        userId: req.body.userId,
        transaction,
        sql: sqlStore({
          db: sql
        }),
        nosql: nosqlStore({
          db: nosql
        })
      }
      return {
        schema,
        context
      }
    })
  )
  return app
}
