const camelCase = require('lodash/camelCase')
const { AppError, logThenThrow } = require('@nudj/library/errors')

module.exports = function rootAll (props = {}) {
  let {
    parentType,
    type,
    name,
    collection
  } = props
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
        [name]: async (root, args, context) => {
          try {
            return await context.store.readAll({
              type: collection
            })
          } catch (error) {
            logThenThrow(
              error,
              `Resolver rootAll ${parentType}.${name} [${type}!]!`
            )
          }
        }
      }
    }
  }
}
