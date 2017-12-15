const { merge } = require('@nudj/library')
const camelCase = require('lodash/camelCase')

function mergeDefinitions (...definitions) {
  let typeDefs = []
  let resolvers = {}
  definitions.forEach((def) => {
    typeDefs = typeDefs.concat(def.typeDefs || [])
    resolvers = merge(resolvers, def.resolvers || {})
  })
  return { typeDefs, resolvers }
}

function defineEnum ({ name, values } = {}) {
  if (!name) throw new Error('defineEnum requires a name')
  if (!values || !values.length) throw new Error('defineEnum requires some values')
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

function definePluralRelation ({
  parentType,
  type,
  name,
  collection
} = {}) {
  if (!parentType) throw new Error('definePluralRelation requires a parentType')
  if (!type) throw new Error('definePluralRelation requires a type')
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
        [name]: (root, args, context) => {
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection
            })
          }, {
            collection
          })
        }
      }
    }
  }
}

function defineEntityPluralRelation ({
  parentType,
  type,
  name,
  collection,
  parentName
} = {}) {
  if (!parentType) throw new Error('defineEntityPluralRelation requires a parentType')
  if (!type) throw new Error('defineEntityPluralRelation requires a type')
  name = name || `${camelCase(type)}s`
  collection = collection || `${camelCase(type)}s`
  parentName = parentName || camelCase(parentType)

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: [${type}!]!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (parent, args, context) => {
          const filters = {
            [parentName]: parent.id
          }
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection,
              filters: params.filters
            })
          }, {
            collection,
            filters
          })
        }
      }
    }
  }
}

function definePluralByFiltersRelation ({
  parentType,
  type,
  name,
  collection,
  filterType
} = {}) {
  if (!parentType) throw new Error('definePluralByFiltersRelation requires a parentType')
  if (!type) throw new Error('definePluralByFiltersRelation requires a type')
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
        [name]: (root, args, context) => {
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection,
              filters: params.filters
            })
          }, merge({
            collection
          }, args))
        }
      }
    }
  }
}

function defineEntityPluralByFiltersRelation ({
  parentType,
  parentName,
  name,
  type,
  collection,
  filterType
} = {}) {
  if (!parentType) throw new Error('defineEntityPluralByFiltersRelation requires a parentType')
  if (!type) throw new Error('defineEntityPluralByFiltersRelation requires a type')
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
        [name]: (parent, args, context) => {
          args.filters[parentName] = parent.id
          return context.transaction((store, params) => {
            return store.readAll({
              type: params.collection,
              filters: params.filters
            })
          }, {
            collection,
            filters: args.filters
          })
        }
      }
    }
  }
}

function defineSingularRelation ({
  parentType,
  parentName,
  name,
  type,
  collection
} = {}) {
  if (!parentType) throw new Error('defineSingularRelation requires a parentType')
  if (!type) throw new Error('defineSingularRelation requires a type')
  parentName = parentName || camelCase(parentType)
  name = name || camelCase(type)
  collection = collection || `${camelCase(type)}s`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(id: ID!): ${type}!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (parent, args, context) => {
          let filters
          if (parent) {
            filters = {
              id: args.id,
              [parentName]: parent.id
            }
          }
          return context.transaction((store, params) => {
            return store.readOne({
              type: params.collection,
              id: params.id,
              filters: params.filters
            })
          }, merge({
            collection,
            id: filters ? undefined : args.id,
            filters
          }))
        }
      }
    }
  }
}

function defineSingularByFiltersRelation ({
  parentType,
  name,
  type,
  collection,
  filterType
} = {}) {
  if (!parentType) throw new Error('defineSingularByFiltersRelation requires a parentType')
  if (!type) throw new Error('defineSingularByFiltersRelation requires a type')
  name = name || `${camelCase(type)}ByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): ${type}!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (root, args, context) => {
          return context.transaction((store, params) => {
            return store.readOne({
              type: params.collection,
              filters: params.filters
            })
          }, {
            collection,
            filters: args.filters
          })
        }
      }
    }
  }
}

function defineEntitySingularByFiltersRelation ({
  parentType,
  type,
  parentName,
  name,
  collection,
  filterType
} = {}) {
  if (!parentType) throw new Error('defineEntitySingularByFiltersRelation requires a parentType')
  if (!type) throw new Error('defineEntitySingularByFiltersRelation requires a type')
  parentName = parentName || camelCase(parentType)
  name = name || `${camelCase(type)}ByFilters`
  collection = collection || `${camelCase(type)}s`
  filterType = filterType || `${type}FilterInput`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}!): ${type}!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (parent, args, context) => {
          let filters = merge(args.filters, {
            [parentName]: parent.id
          })
          return context.transaction((store, params) => {
            return store.readOne({
              type: params.collection,
              filters: params.filters
            })
          }, {
            collection,
            filters
          })
        }
      }
    }
  }
}

module.exports = {
  mergeDefinitions,
  defineEnum,
  definePluralRelation,
  definePluralByFiltersRelation,
  defineSingularRelation,
  defineSingularByFiltersRelation,
  defineEntityPluralRelation,
  defineEntityPluralByFiltersRelation,
  defineEntitySingularByFiltersRelation
}
