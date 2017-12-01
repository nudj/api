const { GraphQLScalarType } = require('graphql')
const { merge } = require('@nudj/library')
const pick = require('lodash/pick')
const omit = require('lodash/omit')

const transaction = require('./arango-adaptor')

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
      return transaction((store, params) => {
        return store.readOne({
          type: 'people',
          id: params.personId
        })
      }, {
        personId: args.id
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
      const connectionSource = await store.readOneOrCreate({
        type: 'connectionSources',
        filters: { name: source },
        data: { name: source }
      })
      let role
      if (to.title) {
        role = await store.readOneOrCreate({
          type: 'roles',
          filters: { name: to.title },
          data: { name: to.title }
        })
      }
      let company
      if (to.company) {
        company = await store.readOneOrCreate({
          type: 'companies',
          filters: { name: to.company },
          data: { name: to.company }
        })
      }
      let person = await store.readOneOrCreate({
        type: 'people',
        filters: { email: to.email },
        data: pick(to, ['email'])
      })
      let connection = await store.readOneOrCreate({
        type: 'connections',
        filters: {
          from,
          person: person.id
        },
        data: merge(omit(to, ['email', 'title']), {
          from,
          source: connectionSource.id,
          role: role && role.id,
          company: company.id,
          person: person.id
        })
      })
      return connection
    },
    getOrCreateConnections: async (obj, args) => {
      const from = obj.id
      const { to, source } = args
      const connectionSource = await store.readOneOrCreate({
        type: 'connectionSources',
        filters: { name: source },
        data: { name: source }
      })
      return Promise.all(to.map(async data => {
        let role
        if (data.title) {
          role = await store.readOneOrCreate({
            type: 'roles',
            filters: { name: data.title },
            data: { name: data.title }
          })
        }
        let company
        if (data.company) {
          company = await store.readOneOrCreate({
            type: 'companies',
            filters: { name: data.company },
            data: { name: data.company }
          })
        }
        let person = await store.readOneOrCreate({
          type: 'people',
          filters: { email: data.email },
          data: pick(data, ['email'])
        })
        let connection = await store.readOneOrCreate({
          type: 'connections',
          filters: {
            from,
            person: person.id
          },
          data: merge(omit(data, ['email', 'title']), {
            from,
            source: connectionSource.id,
            role: role && role.id,
            company: company.id,
            person: person.id
          })
        })
        return connection
      }))
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
          type: 'personTasks',
          filters: merge(filters, {
            person: person.id
          })
        })
        .then(task => {
          if (!task) {
            return null
          }
          return store.update({
            type: 'personTasks',
            id: task.id,
            data
          })
        })
    }
  },
  Hirer: {
    setOnboarded: async (hirer, args, context) => {
      let onboarded = await store.readOne({
        type: 'hirerOnboardedEvents',
        filters: {
          hirer: hirer.id
        }
      })
      if (!onboarded) {
        onboarded = await store.create({
          type: 'hirerOnboardedEvents',
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
