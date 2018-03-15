const createHash = require('hash-generator')
const randomWords = require('random-words')

const createNewBrowserId = () => (
  `${(randomWords({ exactly: 2, join: '_' })).toUpperCase()}_${createHash(16)}`
)

module.exports = {
  typeDefs: `
    extend type Job {
      recordEvent(type: EventType!, browserId: String): Event!
    }
  `,
  resolvers: {
    Job: {
      recordEvent: (job, args, context) => {
        const browserId = args.browserId || createNewBrowserId()
        return context.store.readOneOrCreate({
          type: 'events',
          filters: {
            browserId,
            entityId: job.id
          },
          data: {
            browserId,
            eventType: args.type,
            entityId: job.id,
            entityType: 'jobs'
          }
        })
      }
    }
  }
}
