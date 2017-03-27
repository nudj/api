let restify = require('restify')
let routes = require('./routes')

let server = restify.createServer()
server.use(restify.bodyParser())
routes(server)
server.listen(3001, () => console.log('Api running on http://localhost:3001/'))
