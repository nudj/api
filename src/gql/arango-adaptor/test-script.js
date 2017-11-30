const transaction = require('./transaction')

transaction((store, params) => {
  const omit = require('lodash/omit')
  const get = require('lodash/get')
  const { from, to, source } = params
  return Promise.all([
    store.readOneOrCreate({
      type: 'connectionSources',
      filters: { name: source },
      data: { name: source }
    }),
    to && to.title && store.readOneOrCreate({
      type: 'roles',
      filters: { name: get(to, 'title') },
      data: { name: get(to, 'title') }
    }),
    to && to.company && store.readOneOrCreate({
      type: 'companies',
      filters: { name: get(to, 'company') },
      data: { name: get(to, 'company') }
    }),
    store.readOneOrCreate({
      type: 'people',
      filters: { email: get(to, 'email') },
      data: { email: get(to, 'email') }
    })
  ])
  .then(([
    connectionSource,
    role,
    company,
    person
  ]) => {
    return store.readOneOrCreate({
      type: 'connections',
      filters: {
        from,
        person: person.id
      },
      data: Object.assign(omit(to, ['email', 'title']), {
        from,
        source: connectionSource.id,
        role: role && role.id,
        company: company && company.id,
        person: person.id
      })
    })
  })
}, {
  from: 'person2',
  to: {
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@nudj.co'
  },
  source: 'insomnia'
})
