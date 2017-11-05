const { GraphQLScalarType } = require('graphql')
const { merge } = require('@nudj/library')

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Graphcool DateTime emulated type',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value
})

const Data = new GraphQLScalarType({
  name: 'Data',
  description: 'Data emulated type',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value
})

module.exports = ({ store }) => ({
  Query: {
    referralDepth: (obj, args, context) => {
      let count = null
      function fetchReferral (id) {
        return store.readOne({ type: 'referrals', id }).then(referral => {
          count = count === null ? 0 : count + 1
          if (referral.parent) {
            return fetchReferral(referral.parent)
          } else {
            return count
          }
        })
      }
      return fetchReferral(args.id)
    }
  },
  Mutation: {
    createReferral: (obj, args, context) => {
      const { parent, person, job } = args.input
      return store.readOne({
        type: 'referrals',
        filters: { person, job }
      })
      .then(referral => {
        if (referral) throw new Error('Already referred')
        return store.create({
          type: 'referrals',
          data: { parent, person, job }
        })
      })
    },
    createApplication: (obj, args, context) => {
      const { referral, person, job } = args.input
      return store.readOne({
        type: 'applications',
        filters: { person, job }
      })
      .then(application => {
        if (application) throw new Error('Already applied')
        return store.create({
          type: 'applications',
          data: { referral, person, job }
        })
      })
    },
    getOrCreateConnection: (obj, args) => {
      const { from, to } = args
      return store.readOne({
        type: 'people',
        filters: { email: to.email }
      })
      .then(person => {
        if (person) return person
        return store.create({
          type: 'people',
          data: to
        })
      })
      .then(person => {
        return store.readOne({
          type: 'connections',
          filters: { from, to: person.id }
        })
        .then(connection => {
          if (connection) return connection
          return store.create({
            type: 'connections',
            data: { from, to: person.id }
          })
        })
      })
    },
    getOrCreateConnections: (obj, args) => {
      const { from, to } = args
      return Promise.all(to.map(connection => {
        return store.readOne({
          type: 'people',
          filters: { email: connection.email }
        })
        .then(person => {
          if (person) return person
          return store.create({
            type: 'people',
            data: connection
          })
        })
      }))
      .then(people => {
        return Promise.all(people.map(person => {
          return store.readOne({
            type: 'connections',
            filters: { from, to: person.id }
          })
          .then(connection => {
            if (connection) return connection
            return store.create({
              type: 'connections',
              data: { from, to: person.id }
            })
          })
        }))
      })
    }
  },
  Company: {
    hirers: (obj, args, context) => {
      const company = obj.id
      return store.readAll({
        type: 'hirers',
        filters: { company }
      })
      .then(hirers => {
        return store.readMany({
          type: 'people',
          ids: hirers.map(hirer => hirer.person)
        })
        .then(people => {
          return people.map((people, index) => merge(person, {
            hirerCreated: hirers[index].created
          }))
        })
      })
    },
    hirerById: (obj, args, context) => {
      const personId = args.id
      const company = obj.id
      return store.readOne({
        type: 'people',
        id: personId
      })
      .then(person => {
        return store.readOne({
          type: 'hirers',
          filters: { company, person: person.id }
        })
        .then(hirer => console.log('HIRER', hirer, person) || merge(person, {
          hirerCreated: hirer.created
        }))
      })
    },
    hirerByFilters: (obj, args, context) => {
      const filters = args.filters
      const company = obj.id
      return store.readOne({
        type: 'people',
        filters
      })
      .then(person => {
        return store.readOne({
          type: 'hirers',
          filters: { company, person: person.id }
        })
        .then(hirer => merge(person, {
          hirerCreated: hirer.created
        }))
      })
    },
    hirersByFilters: (obj, args, context) => {
      const filters = args.filters
      const company = obj.id
      return store.readAll({
        type: 'people',
        filters
      })
      .then(people => {
        return Promise.all(people.map(person => store.readOne({
          type: 'hirers',
          filters: { company, person: person.id }
        }).catch(() => null)))
        .then(hirers => people.reduce((hirerPeople, person, index) => {
          const hirer = hirers[index]
          if (hirer) {
            hirerPeople = hirerPeople.concat(merge(person, {
              hirerCreated: hirer.created
            }))
          }
          return hirerPeople
        }, []))
      })
    }
  },
  Person: {
    hirerForCompany: (obj, args, context) => {
      const person = obj.id
      return store.readOne({
        type: 'hirers',
        filters: { person }
      })
      .then(hirer => !hirer ? null : store.readOne({
        type: 'companies',
        id: hirer.company
      }))
    },
    incompleteTaskCount: (obj, args, context) => {
      const person = obj.id
      return store.readOne({
        type: 'hirers',
        filters: { person }
      })
      .then(hirer => store.readOne({
        type: 'companies',
        id: hirer.company
      }))
      .then(company => Promise.all([
        store.readAll({
          type: 'companyTasks',
          filters: { company: company.id, completed: false }
        }),
        store.readAll({
          type: 'personTasks',
          filters: { person, completed: false }
        })
      ]))
      .then(tasks => [].concat(...tasks).length)
    },
    getOrCreateConnection: (obj, args) => {
      const from = obj.id
      const { to } = args
      return store.readOne({
        type: 'people',
        filters: { email: to.email }
      })
      .then(person => {
        if (person) return person
        return store.create({
          type: 'people',
          data: to
        })
      })
      .then(person => {
        return store.readOne({
          type: 'connections',
          filters: { from, to: person.id }
        })
        .then(connection => {
          if (connection) return connection
          return store.create({
            type: 'connections',
            data: { from, to: person.id }
          })
        })
      })
    },
    getOrCreateConnections: (obj, args) => {
      const from = obj.id
      const { to } = args
      return Promise.all(to.map(connection => {
        return store.readOne({
          type: 'people',
          filters: { email: connection.email }
        })
        .then(person => {
          if (person) return person
          return store.create({
            type: 'people',
            data: connection
          })
        })
      }))
      .then(people => {
        return Promise.all(people.map(person => {
          return store.readOne({
            type: 'connections',
            filters: { from, to: person.id }
          })
          .then(connection => {
            if (connection) return connection
            return store.create({
              type: 'connections',
              data: { from, to: person.id }
            })
          })
        }))
      })
    }
  },
  Referral: {
    _depth: (obj, args, context) => {
      let count = null
      function fetchItem (id) {
        return store.readOne({ type: typeName.plural, id }).then(item => {
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
