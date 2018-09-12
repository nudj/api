const createHash = require('hash-generator')
const randomWords = require('random-words')

const createNewBrowserId = () => (
  `${(randomWords({ exactly: 2, join: '_' })).toUpperCase()}_${createHash(16)}`
)

module.exports = {
  typeDefs: `
    extend type Job {
      recordViewEvent(browserId: String): JobViewEvent!
    }
  `,
  resolvers: {
    Job: {
      recordViewEvent: (job, args, context) => {
        const browserId = args.browserId || createNewBrowserId()
        return context.sql.create({
          type: 'jobViewEvents',
          data: {
            browserId,
            job: job.id
          }
        })
      }
    }
  }
}
