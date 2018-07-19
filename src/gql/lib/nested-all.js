const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

module.exports = function nestedAll (props = {}) {
  let {
    parentType,
    parentName,
    name,
    type,
    collection,
    parentPropertyName
  } = props
  if (!parentType) { throw new AppError('nestedAll requires a parentType') }
  if (!type) throw new AppError('nestedAll requires a type')
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
        [name]: async (parent, args, context) => {
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

          return context.store[params.storeMethod]({
            type: params.collection,
            filters: params.filters,
            ids: params.ids
          })
        }
      }
    }
  }
}
