let Store = require('./arango')

function handleResolve (data) {
  if (data.error) {
    console.error('RESPONSE ERROR', data.error.message)
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
  console.error('REQUEST ERROR', error.message)
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
  server.get('/:type/first', (req, res) => {
    Store
      .getOne(req.params.type, req.query)
      .then(handleResolve)
      .then(getResponder(res))
      .catch(handleReject)
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
      .then(getResponder(res))
      .catch(handleReject)
  })
  server.post('/referrals', (req, res) => {
    Store
      .createUnique('referrals', req.body)
      .then(handleResolve)
      .then(getResponder(res))
      .catch(handleReject)
  })
}
