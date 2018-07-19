const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

module.exports =
function rootSingle (props = {}) {
  let {
    parentType,
    type,
    name,
    collection
  } = props
  if (!parentType) { throw new AppError('rootSingle requires a parentType') }
  if (!type) throw new AppError('rootSingle requires a type')
  name = name || camelCase(type)
  collection = collection || `${camelCase(type)}s`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(id: ID): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (root, args, context) => {
          const id = args.id
          if (id === undefined) {
            return null
          }
          return context.store.readOne({
            type: collection,
            id: args.id
          })
        }
      }
    }
  }
}
