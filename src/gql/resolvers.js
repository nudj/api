const { GraphQLScalarType } = require('graphql')
const { merge } = require('@nudj/library')
const _pick = require('lodash/pick')
const _omit = require('lodash/omit')

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Graphcool DateTime emulated type',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => ast.value
})

const Data = new GraphQLScalarType({
  name: 'Data',
  description: 'Data emulated type',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => ast.value
})

module.exports = ({ store }) => ({
  Query: {
    user: (obj, args) => {
      return store.readOne({
        type: 'people',
        id: args.id
      })
    }
  },
  Mutation: {
    user: (obj, args) => {
      return store.readOne({
        type: 'people',
        id: args.id
      })
    }
  },
  Person: {
    incompleteTaskCount: (obj, args, context) => {
      const person = obj.id
      return store
        .readOne({
          type: 'hirers',
          filters: { person }
        })
        .then(hirer =>
          store.readOne({
            type: 'companies',
            id: hirer.company
          })
        )
        .then(company =>
          Promise.all([
            store.readAll({
              type: 'companyTasks',
              filters: { company: company.id, completed: false }
            }),
            store.readAll({
              type: 'personTasks',
              filters: { person, completed: false }
            })
          ])
        )
        .then(tasks => [].concat(...tasks).length)
    },
    getOrCreateConnection: async (obj, args) => {
      const from = obj.id
      const { to, source } = args
      let person = await store.readOne({
        type: 'people',
        filters: { email: to.email }
      })
      if (!person) {
        person = await store.create({
          type: 'people',
          data: _pick(to, ['email'])
        })
      }
      let connection = await store.readOne({
        type: 'connections',
        filters: {
          from,
          person: person.id
        }
      })
      if (!connection) {
        connection = await store.create({
          type: 'connections',
          data: merge(
            {
              from,
              source,
              person: person.id
            },
            _omit(to, ['email'])
          )
        })
      }
      return connection
    },
    getOrCreateConnections: (obj, args) => {
      const from = obj.id
      const { to, source } = args
      return Promise.all(
        to.map(connection => {
          return store
            .readOne({
              type: 'people',
              filters: { email: connection.email }
            })
            .then(person => {
              if (person) return person
              return store.create({
                type: 'people',
                data: _pick(connection, ['email'])
              })
            })
            .then(person => {
              return store
                .readOne({
                  type: 'connections',
                  filters: { from, person: person.id }
                })
                .then(existingConnection => {
                  if (existingConnection) return existingConnection
                  return store.create({
                    type: 'connections',
                    data: merge(
                      {
                        from,
                        source,
                        person: person.id
                      },
                      _omit(connection, ['email'])
                    )
                  })
                })
            })
        })
      )
    },
    connections: (person, args) => {
      const from = person.id
      return store.readAll({
        type: 'connections',
        filters: { from }
      })
    },
    getOrCreateFormerEmployer: (obj, args) => {
      const person = obj.id
      const { formerEmployer: newFormerEmployer, source } = args
      return store
        .readOne({
          type: 'companies',
          filters: { name: newFormerEmployer.name }
        })
        .then(storedCompany => {
          if (storedCompany) return storedCompany
          // enrich company with clearbit data here
          return store.create({
            type: 'companies',
            data: newFormerEmployer
          })
        })
        .then(storedCompany => {
          const company = storedCompany.id
          return store
            .readOne({
              type: 'formerEmployers',
              filters: {
                person,
                company
              }
            })
            .then(formerEmployer => {
              if (formerEmployer) return formerEmployer
              return store.create({
                type: 'formerEmployers',
                data: merge(
                  {
                    person,
                    source,
                    company
                  },
                  newFormerEmployer
                )
              })
            })
        })
    },
    updateTaskByFilters: (person, args) => {
      const { filters, data } = args
      return store
        .readOne({
          type: 'PersonTasks',
          filters: merge(filters, {
            person: person.id
          })
        })
        .then(task => {
          if (!task) {
            return null
          }
          return store.update({
            type: 'PersonTasks',
            id: task.id,
            data
          })
        })
    }
  },
  Hirer: {
    setOnboarded: async (hirer, args, context) => {
      let onboarded = await store.readOne({
        type: 'hirerOnboardeds',
        filters: {
          hirer: hirer.id
        }
      })
      if (!onboarded) {
        onboarded = await store.create({
          type: 'hirerOnboardeds',
          data: {
            hirer: hirer.id
          }
        })
      }
      return onboarded
    }
  },
  Referral: {
    _depth: (obj, args, context) => {
      let count = null
      function fetchItem (id) {
        return store.readOne({ type: 'referrals', id }).then(item => {
          count = count === null ? 0 : count + 1
          if (item.parent) {
            return fetchItem(item.parent)
          } else {
            return count
          }
        })
      }
      return fetchItem(obj.id)
    }
  },
  DateTime,
  Data
})
