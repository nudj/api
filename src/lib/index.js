let restify = require('restify')
let routes = require('./routes')

let server = restify.createServer()
routes(server)
server.listen(3001, () => console.log('Api running on http://localhost:3001/'))
