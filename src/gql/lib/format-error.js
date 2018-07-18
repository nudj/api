const randomWords = require('random-words')
const { logger } = require('@nudj/library')

const formatError = gqlError => {
  const ID = `api_${randomWords({ exactly: 2, join: '_' })}`.toUpperCase()

  // originalError is the error thrown inside a resolver
  // https://github.com/graphql/graphql-js/blob/44f315d1ff72ab32b794937fd11a7f8e792fd873/src/error/GraphQLError.js#L66-L69
  if (!gqlError.originalError) {
    gqlError.id = ID
    logger('error', ID, gqlError)
    return gqlError
  }

  logger('error', ID, gqlError.originalError)
  return {
    ...gqlError.originalError,
    id: ID,
    message: gqlError.originalError.message,
    path: gqlError.path,
    locations: gqlError.locations
  }
}

module.exports = formatError
