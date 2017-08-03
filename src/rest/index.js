let restify = require('restify')
let morgan = require('morgan')
let routes = require('./routes')

let server = restify.createServer()
server.use(morgan('combined'))
server.use(restify.bodyParser())
server.use(restify.queryParser())
routes(server)
module.exports = server
