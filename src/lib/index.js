var restify = require('restify')

function respond (req, res, next) {
  res.send('hello ' + req.params.name)
  next()
}

var server = restify.createServer()
server.get('/hello/:name', respond)
server.head('/hello/:name', respond)

server.listen(3001, () => console.log('Api running on http://localhost:3001/'))
