let restify = require('restify')
let morgan = require('morgan')
let routes = require('./routes')

let server = restify.createServer()
server.use(morgan('combined'))
server.use(restify.bodyParser())
server.use(restify.queryParser())
routes(server)
server.listen(81, () => console.log('Api running on http://localhost:81/'))

// let GQL = require('../gql')
// let gql = GQL({ storeAdaptor: {} })
