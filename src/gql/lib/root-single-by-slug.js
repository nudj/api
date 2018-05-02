const camelCase = require('lodash/camelCase')
const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')
const { INDICES } = require('../../lib/sql')

module.exports = function rootSingleBySlug (props = {}) {
  let {
    parentType,
    type,
    name,
    collection
  } = props
  if (!parentType) { throw new AppError('rootSingleBySlug requires a parentType') }
  if (!type) throw new AppError('rootSingleBySlug requires a type')
  name = name || `${camelCase(type)}BySlug`
  collection = collection || `${camelCase(type)}s`

  return {
    typeDefs: `
      extend type ${parentType} {
        ${name}(slug: String): ${type}
      }
    `,
    resolvers: {
      [parentType]: {
        [name]: handleErrors((root, args, context) => {
          const slug = args.slug
          if (slug === undefined) {
            return null
          }
          return context.sql.readOne({
            type: collection,
            index: INDICES[collection].slug,
            key: slug
          })
        })
      }
    }
  }
}
