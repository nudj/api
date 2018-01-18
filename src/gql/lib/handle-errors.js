const randomWords = require('random-words')
const padRight = require('pad-right')
const { logger } = require('@nudj/library')
const { NotFound } = require('@nudj/library/errors')

module.exports = function handleErrors (resolver) {
  return async (...args) => {
    try {
      return await resolver(...args)
    } catch (error) {
      const ID = `api_${randomWords({ exactly: 2, join: '_' })}`.toUpperCase()
      const upstreamLog = error.log || []
      const boundaries = [[error.name, error.message], ...upstreamLog]
      const toLog = boundaries.reduce((log, boundary) => {
        log = log.concat('\n', padRight('', 23, ' '), ...boundary)
        return log
      }, [])
      logger('error', ID, ...toLog, '\n')
      if (error.constructor !== NotFound) {
        error.message = `API ERROR: ${ID}`
      }
      throw error
    }
  }
}
