let jsonServer = require('json-server')

module.exports = ({
  data,
  addCustomHandlers
}) => {
  let server = jsonServer.create()
  let router = jsonServer.router(data)
  let middlewares = jsonServer.defaults()
  server.use(middlewares)
  if (addCustomHandlers) {
    server = addCustomHandlers(server)
  }
  server.use(router)
  return server
}
