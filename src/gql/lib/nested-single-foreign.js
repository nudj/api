const camelCase = require('lodash/camelCase')
const isObject = require('lodash/isObject')
const { AppError } = require('@nudj/library/errors')

module.exports = function nestedSingleForeign (props = {}) {
  let {
    parentType,
    name,
    type,
    collection,
    propertyName
  } = props
  if (!parentType) { throw new AppError('nestedSingleForeign requires a parentType') }
  if (!type) throw new AppError('nestedSingleForeign requires a type')
  const camelParentType = camelCase(parentType)
  const camelRelationType = camelCase(type)
  name = name || camelRelationType
  collection = collection || `${camelRelationType}s`
  propertyName = propertyName || camelParentType

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}: ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: (parent, args, context) => {
          if (!parent.id) return null
          if (isObject(parent.id)) return parent.id
          return context.store.readOne({
            type: collection,
            filters: {
              [propertyName]: parent.id
            }
          })
        }
      }
    }
  }
}
