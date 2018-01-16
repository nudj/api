const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function nestedSingle (
  { parentType, name, type, collection, propertyName } = {}
) {
  if (!parentType) { throw new AppError('nestedSingle requires a parentType') }
  if (!type) throw new AppError('nestedSingle requires a type')
  const camelRelationType = camelCase(type)
  name = name || camelRelationType
  collection = collection || `${camelRelationType}s`
  propertyName = propertyName || camelRelationType

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((parent, args, context) => {
          const id = parent[propertyName]
          if (!id) return null

          return context.transaction(
            (store, params) => {
              return store.readOne({
                type: params.collection,
                id: params.id
              })
            },
            {
              collection,
              id
            }
          )
        })
      }
    }
  }
}
