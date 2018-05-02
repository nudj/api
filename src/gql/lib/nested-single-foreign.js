const camelCase = require('lodash/camelCase')
const isObject = require('lodash/isObject')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

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
        [name]: handleErrors((parent, args, context) => {
          if (!parent.id) return null
          if (isObject(parent.id)) return parent.id
          return context.sql.readOne({
            type: collection,
            filters: {
              [propertyName]: parent.id
            }
          })
        })
      }
    }
  }
}
