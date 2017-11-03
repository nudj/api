const format = require('date-fns/format')
const { merge } = require('@nudj/library')
const jsonServer = require('json-server')

function injectDate ({req, res, next}) {
  const dateNow = format(Date.now(), 'YYYY-MM-DDTHH:mm:ss.SSSZ')

  if (req.method === 'POST') {
    req.body = merge(req.body, {
      created: dateNow,
      modified: dateNow
    })
  } else if (req.method === 'PATCH') {
    req.body = merge(req.body, {
      modified: dateNow
    })
  }

  next()
}

module.exports = ({
  data,
  addCustomHandlers
}) => {
  let server = jsonServer.create()
  let router = jsonServer.router(data)
  let middlewares = jsonServer.defaults()
  server.use(middlewares)
  server.use(jsonServer.bodyParser)
  server.use((req, res, next) => injectDate({req, res, next}))
  if (addCustomHandlers) {
    server = addCustomHandlers(server)
  }
  server.use(router)
  return server
}
