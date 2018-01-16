const camelCase = require('lodash/camelCase')
const { AppError, logThenThrow } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function rootAll ({ parentType, type, name, collection } = {}) {
  if (!parentType) { throw new AppError('rootAll requires a parentType') }
  if (!type) throw new AppError('rootAll requires a type')
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
              `Resolver rootAll ${parentType}.${name} [${type}!]!`
            )
          }
        })
      }
    }
  }
}
