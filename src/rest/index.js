const parseQueryBooleans = require('../lib/parse-query-booleans')
const restify = require('restify')
const morgan = require('morgan')
const routes = require('./routes')

const server = restify.createServer()
server.use(morgan('combined'))
server.use(restify.bodyParser())
server.use(restify.queryParser())
server.use(parseQueryBooleans)
routes(server)
module.exports = server
