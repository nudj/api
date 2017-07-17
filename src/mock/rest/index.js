let jsonServer = require('json-server')

module.exports = ({data}) => {
  let server = jsonServer.create()
  let router = jsonServer.router(data)
  let middlewares = jsonServer.defaults()
  server.use(middlewares)
  server.use(router)
  return server
}
