let restify = require('restify')
let routes = require('./routes')

let server = restify.createServer()
server.use(restify.bodyParser())
server.use(restify.queryParser())
routes(server)
server.listen(81, () => console.log('Api running on http://localhost:81/'))
