const { GraphQLScalarType } = require('graphql')
const { merge } = require('@nudj/library')
const pick = require('lodash/pick')
const omit = require('lodash/omit')

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

module.exports = ({ transaction }) => ({
  Query: {
    user: (obj, args) => {
      return transaction((store, params) => {
        return store.readOne({
          type: 'people',
          id: params.person
        })
      }, {
        person: args.id
      })
    },
    setNotification: (obj, args) => {
      return { type: args.type, message: args.message }
    }
  },
  Mutation: {
    user: (obj, args) => {
      return transaction((store, params) => {
        return store.readOne({
          type: 'people',
          id: params.person
        })
      }, {
        person: args.id
      })
    },
    setNotification: (obj, args) => {
      return { type: args.type, message: args.message }
    },
    createSurvey: (obj, args) => {
      const surveySections = []
      return store.create({
        type: 'surveys',
        data: merge(args.input, { surveySections })
      })
    },
    createSurveySection: (obj, args) => {
      const surveyQuestions = []
      return store.create({
        type: 'surveySections',
        data: merge(args.input, { surveyQuestions })
      })
      .then(section => {
        return store.readOne({
          type: 'surveys',
          id: section.survey
        })
        .then(survey => {
          const { surveySections = [] } = survey
          return store.update({
            type: 'surveys',
            id: section.survey,
            data: {
              surveySections: surveySections.concat(section.id)
            }
          })
        })
        .then(() => section)
      })
    },
    createSurveyQuestion: (obj, args) => {
      return store.create({
        type: 'surveyQuestions',
        data: args.input
      })
      .then(question => {
        return store.readOne({
          type: 'surveySections',
          id: question.surveySection
        })
        .then(section => {
          const { surveyQuestions = [] } = section
          return store.update({
            type: 'surveySections',
            id: question.surveySection,
            data: {
              surveyQuestions: surveyQuestions.concat(question.id)
            }
          })
        })
        .then(() => question)
      })
    }
  },
  Person: {
    incompleteTaskCount: (obj, args) => {
      const person = obj.id
      return transaction((store, params) => {
        const { person } = params
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
      }, {
        person
      })
    },
    getOrCreateConnection: (obj, args) => {
      const from = obj.id
      const { to, source } = args
      return transaction((store, params) => {
        const { from, to, source } = params
        return Promise.all([
          store.readOneOrCreate({
            type: 'connectionSources',
            filters: { name: source },
            data: { name: source }
          }),
          to.title && store.readOneOrCreate({
            type: 'roles',
            filters: { name: to.title },
            data: { name: to.title }
          }),
          to.company && store.readOneOrCreate({
            type: 'companies',
            filters: { name: to.company },
            data: { name: to.company }
          }),
          store.readOneOrCreate({
            type: 'people',
            filters: { email: to.email },
            data: pick(to, ['email'])
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
            data: merge(omit(to, ['email', 'title']), {
              from,
              source: connectionSource.id,
              role: role && role.id,
              company: company && company.id,
              person: person.id
            })
          })
        })
      }, {
        from,
        to,
        source
      })
    },
    getOrCreateConnections: async (obj, args) => {
      const from = obj.id
      const { to, source } = args
      const connectionSource = await transaction((store, params) => {
        const { source } = params
        return store.readOneOrCreate({
          type: 'connectionSources',
          filters: { name: source },
          data: { name: source }
        })
      }, { source })
      if (!connectionSource) {
        throw new Error('Unable to create ConnectionSource')
      }
      return Promise.all(to.map(async data => {
        await transaction((store, params) => {
          const { from, connectionSource } = params
          return Promise.all([
            data.title && store.readOneOrCreate({
              type: 'roles',
              filters: { name: data.title },
              data: { name: data.title }
            }),
            data.company && store.readOneOrCreate({
              type: 'companies',
              filters: { name: data.company },
              data: { name: data.company }
            }),
            store.readOneOrCreate({
              type: 'people',
              filters: { email: data.email },
              data: pick(data, ['email'])
            })
          ])
          .then(([
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
              data: merge(omit(data, ['email', 'title']), {
                from,
                source: connectionSource.id,
                role: role && role.id,
                company: company && company.id,
                person: person.id
              })
            })
          })
        }, {
          from,
          connectionSource
        })
      }))
    },
    connections: (person, args) => {
      return transaction((store, params) => {
        const { from } = params
        return store.readAll({
          type: 'connections',
          filters: { from }
        })
      }, {
        from: person.id
      })
    },
    getOrCreateFormerEmployer: (obj, args) => {
      return transaction((store, params) => {
        const {
          person,
          newFormerEmployer,
          source
        } = params
        return store.readOne({
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
          return store.readOneOrCreate({
            type: 'formerEmployers',
            filters: {
              person,
              company
            },
            data: merge({
              person,
              source,
              company
            }, newFormerEmployer)
          })
        })
      }, {
        person: obj.id,
        newFormerEmployer: args.formerEmployer,
        source: args.source
      })
    },
    updateTaskByFilters: (person, args) => {
      return transaction((store, params) => {
        const { person, filters, data } = params
        return store.readOne({
          type: 'personTasks',
          filters: merge(filters, { person })
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
      }, {
        person: person.id,
        filters: args.filters,
        data: args.data
      })
    }
  },
  Hirer: {
    setOnboarded: async (hirer, args) => {
      return transaction((store, params) => {
        const { hirer } = params
        return store.readOneOrCreate({
          type: 'hirerOnboardedEvents',
          filters: { hirer },
          data: { hirer }
        })
      }, {
        hirer: hirer.id
      })
    }
  },
  DateTime,
  Data
})
