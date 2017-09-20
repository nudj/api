let Store = require('./arango')

function handleResolve (data) {
  if (data.error) {
    console.error('RESPONSE ERROR', data)
    return Promise.resolve({
      status: data.code,
      body: data
    })
  }
  return Promise.resolve({
    status: 200,
    body: data
  })
}

function handleReject (error) {
  console.error('REQUEST ERROR', error)
  return Promise.resolve({
    status: 500,
    body: {
      code: 500,
      message: 'Internal server error'
    }
  })
}

function getResponder (res) {
  return (data) => res.status(data.status) && res.json(data.body)
}

module.exports = (server) => {
  server.get('/:type/filter', (req, res) => {
    Store
      .getFiltered(req.params.type, req.query)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.get('/:type/first', (req, res) => {
    Store
      .getOne(req.params.type, req.query)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.get('/:type/:id', (req, res) => {
    let filters
    if (req.params.id.match(/^\d+$/)) {
      filters = { id: req.params.id }
    } else {
      filters = { slug: req.params.id }
    }
    Store
      .getOne(req.params.type, filters)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.get('/:type', (req, res) => {
    Store
      .getAll(req.params.type)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.post('/:type', (req, res) => {
    Store
      .post(req.params.type, req.body)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.del('/:type/:id', (req, res) => {
    Store
      .del(req.params.type, req.params.id)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
  server.patch('/:type/:id', (req, res) => {
    Store
      .patch(req.params.type, req.params.id, req.body)
      .then(handleResolve)
      .catch(handleReject)
      .then(getResponder(res))
  })
}
