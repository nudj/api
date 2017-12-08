const { merge } = require('@nudj/library')

function mergeDefinitions (...definitions) {
  let typeDefs = []
  let resolvers = {}
  definitions.forEach((def) => {
    typeDefs = typeDefs.concat(def.typeDefs)
    resolvers = merge(resolvers, def.resolvers)
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
          return context.transaction((store) => {
            return store.readAll({
              type: collection
            })
          })
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
  if (!name) throw new Error('defineSingularRelation requires a name')
  if (!type) throw new Error('defineSingularRelation requires a type')
  if (!collection) throw new Error('defineSingularRelation requires a collection')

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(id: ID!): ${type}!
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (root, args, context) => {
          return context.transaction((store, params) => {
            return store.readOne({
              type: collection,
              id: params.id
            })
          }, {
            id: args.id
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
  defineSingularRelation
}
