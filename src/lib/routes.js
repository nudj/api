let Store = require('./arango')

function handleResolve (data) {
  if (data.error) {
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
  console.error('ERROR', error.message)
  return Promise.resolve({
    status: 500,
    body: {
      code: 500,
      message: 'Internal server error'
    }
  })
}

module.exports = (server) => {
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
      .then((data) => res.status(data.status) && res.json(data.body))
  })
}
