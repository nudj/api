const camelCase = require('lodash/camelCase')
const padRight = require('pad-right')
const randomWords = require('random-words')
const { AppError, NotFound, logThenThrow } = require('@nudj/library/errors')
const { merge, logger } = require('@nudj/library')

function handleErrors (resolver) {
  return async (...args) => {
    try {
      return await resolver(...args)
    } catch (error) {
      const ID = `api_${randomWords({ exactly: 2, join: '_' })}`.toUpperCase()
      const upstreamLog = error.log || []
      const boundaries = [[error.name, error.message], ...upstreamLog]
      const toLog = boundaries.reduce((log, boundary) => {
        log = log.concat('\n', padRight('', 23, ' '), ...boundary)
        return log
      }, [])
      logger('error', ID, ...toLog, '\n')
      if (error.constructor !== NotFound) {
        error.message = `API ERROR: ${ID}`
      }
      throw error
    }
  }
}

function mergeDefinitions (...definitions) {
  let typeDefs = []
  let resolvers = {}
  definitions.forEach(def => {
    typeDefs = typeDefs.concat(def.typeDefs || [])
    resolvers = merge(resolvers, def.resolvers || {})
  })
  return { typeDefs, resolvers }
}

function defineEnum ({ name, values } = {}) {
  if (!name) throw new AppError('defineEnum requires a name')
  if (!values || !values.length) { throw new AppError('defineEnum requires some values') }
  return {
    typeDefs: `
      enum ${name} {
        ${values.join(`
        `)}
      }
    `,
    resolvers: {},
    values: values.reduce((valuesMap, value) => {
      valuesMap[value] = value
      return valuesMap
    }, {})
  }
}

function definePluralRelation ({ parentType, type, name, collection } = {}) {
  if (!parentType) { throw new AppError('definePluralRelation requires a parentType') }
  if (!type) throw new AppError('definePluralRelation requires a type')
  name = name || `${camelCase(type)}s`
  collection = collection || `${camelCase(type)}s`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors(async (root, args, context) => {
          try {
            return await context.transaction(
              (store, params) => {
                return store.readAll({
                  type: params.collection
                })
              },
              {
                collection
              }
            )
          } catch (error) {
            logThenThrow(
              error,
              `Resolver definePluralRelation ${parentType}.${name} [${type}!]!`
            )
          }
        })
      }
    }
  }
}

function definePluralByFiltersRelation (
  { parentType, type, name, collection, filterType } = {}
) {
  if (!parentType) { throw new AppError('definePluralByFiltersRelation requires a parentType') }
  if (!type) throw new AppError('definePluralByFiltersRelation requires a type')
  name = name || `${camelCase(type)}sByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection,
              filters: params.filters
            })
          }, merge({
            collection
          }, args))
        })
      }
    }
  }
}

function defineSingularRelation ({ parentType, type, name, collection } = {}) {
  if (!parentType) { throw new AppError('defineSingularRelation requires a parentType') }
  if (!type) throw new AppError('defineSingularRelation requires a type')
  name = name || camelCase(type)
  collection = collection || `${camelCase(type)}s`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(id: ID!): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                id: params.id
              })
            },
            {
              collection,
              id: args.id
            }
          )
        })
      }
    }
  }
}

function defineSingularByFiltersRelation (
  { parentType, name, type, collection, filterType } = {}
) {
  if (!parentType) { throw new AppError('defineSingularByFiltersRelation requires a parentType') }
  if (!type) { throw new AppError('defineSingularByFiltersRelation requires a type') }
  name = name || `${camelCase(type)}ByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                filters: params.filters
              })
            },
            {
              collection,
              filters: args.filters
            }
          )
        })
      }
    }
  }
}

function defineEntityPluralRelation (
  { parentType, type, name, collection, parentName, parentPropertyName } = {}
) {
  if (!parentType) { throw new AppError('defineEntityPluralRelation requires a parentType') }
  if (!type) throw new AppError('defineEntityPluralRelation requires a type')
  const camelTypePlural = `${camelCase(type)}s`
  name = name || camelTypePlural
  collection = collection || camelTypePlural
  parentName = parentName || camelCase(parentType)
  parentPropertyName = parentPropertyName || camelTypePlural

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          const params = {
            collection
          }
          if (parent[parentPropertyName]) {
            params.ids = parent[parentPropertyName]
            params.storeMethod = 'readMany'
          } else {
            params.filters = {
              [parentName]: parent.id
            }
            params.storeMethod = 'readAll'
          }
          return context.transaction((store, params) => {
            return store[params.storeMethod]({
              type: params.collection,
              filters: params.filters,
              ids: params.ids
            })
          }, params)
        })
      }
    }
  }
}

function defineEntityPluralByFiltersRelation (
  { parentType, parentName, name, type, collection, filterType } = {}
) {
  if (!parentType) {
    throw new AppError(
      'defineEntityPluralByFiltersRelation requires a parentType'
    )
  }
  if (!type) { throw new AppError('defineEntityPluralByFiltersRelation requires a type') }
  parentName = parentName || camelCase(parentType)
  name = name || `${camelCase(type)}sByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          args.filters[parentName] = parent.id
          return context.transaction(
            (store, params) => {
              return store.readAll({
                type: params.collection,
                filters: params.filters
              })
            },
            {
              collection,
              filters: args.filters
            }
          )
        })
      }
    }
  }
}

function defineEntitySingularRelation (
  { parentType, name, type, collection, propertyName } = {}
) {
  const camelType = camelCase(type)
  if (!parentType) { throw new AppError('defineEntitySingularRelation requires a parentType') }
  if (!type) throw new AppError('defineEntitySingularRelation requires a type')
  name = name || camelType
  collection = collection || `${camelType}s`
  propertyName = propertyName || name || camelType

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                id: params.id
              })
            },
            {
              collection,
              id: parent[propertyName]
            }
          )
        })
      }
    }
  }
}

function defineEntitySingularByFiltersRelation (
  { parentType, type, parentName, name, collection, filterType } = {}
) {
  if (!parentType) {
    throw new AppError(
      'defineEntitySingularByFiltersRelation requires a parentType'
    )
  }
  if (!type) { throw new AppError('defineEntitySingularByFiltersRelation requires a type') }
  parentName = parentName || camelCase(parentType)
  name = name || `${camelCase(type)}ByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          let filters = merge(args.filters, {
            [parentName]: parent.id
          })
          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                filters: params.filters
              })
            },
            {
              collection,
              filters
            }
          )
        })
      }
    }
  }
}

module.exports = {
  defineEntityPluralByFiltersRelation,
  defineEntityPluralRelation,
  defineEntitySingularByFiltersRelation,
  defineEntitySingularRelation,
  defineEnum,
  definePluralByFiltersRelation,
  definePluralRelation,
  defineSingularByFiltersRelation,
  defineSingularRelation,
  handleErrors,
  mergeDefinitions
}
