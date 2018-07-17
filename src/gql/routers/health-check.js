const express = require('express')

const Router = () => {
  const router = express.Router()
  router.get('/healthcheck', (req, res) => {
    res.send('OK')
  })
  return router
}

module.exports = Router
