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
  name,
  type,
  collection
} = {}) {
  if (!parentType) throw new Error('definePluralRelation requires a parentType')
  if (!name) throw new Error('definePluralRelation requires a name')
  if (!type) throw new Error('definePluralRelation requires a type')
  if (!collection) throw new Error('definePluralRelation requires a collection')

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

function definePluralByFiltersRelation ({
  parentType,
  name,
  type,
  collection,
  filterType
} = {}) {
  if (!parentType) throw new Error('definePluralByFiltersRelation requires a parentType')
  if (!name) throw new Error('definePluralByFiltersRelation requires a name')
  if (!type) throw new Error('definePluralByFiltersRelation requires a type')
  if (!collection) throw new Error('definePluralByFiltersRelation requires a collection')
  if (!filterType) throw new Error('definePluralByFiltersRelation requires a filterType')

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(filters: ${filterType}): [${type}!]!
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

function defineSingularRelation ({
  parentType,
  name,
  type,
  collection
} = {}) {
  if (!parentType) throw new Error('defineSingularRelation requires a parentType')
  if (!type) throw new Error('defineSingularRelation requires a type')
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
        [name]: (root, args, context) => {
          return context.transaction((store, params) => {
            return store.readOne({
              type: params.collection,
              id: params.id
            })
          }, merge({
            collection
          }, args))
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
        ${name}(filters: ${filterType}!): ${type}
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
          }, merge({
            collection
          }, args))
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
  defineSingularByFiltersRelation
}
