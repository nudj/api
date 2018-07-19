const camelCase = require('lodash/camelCase')
const isObject = require('lodash/isObject')
const { AppError } = require('@nudj/library/errors')

module.exports = function nestedSingle (props = {}) {
  let {
    parentType,
    name,
    type,
    collection,
    propertyName
  } = props
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
        [name]: (parent, args, context) => {
          const id = parent[propertyName]
          if (!id) return null
          if (isObject(id)) return id
          return context.store.readOne({
            type: collection,
            id
          })
        }
      }
    }
  }
}
