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
        return context.transaction((store, params) => {
          const { browserId, entityId, eventType } = params
          return store.readOneOrCreate({
            type: 'events',
            filters: {
              entityId,
              browserId
            },
            data: {
              eventType,
              entityId,
              browserId,
              entityType: 'jobs'
            }
          })
        }, {
          entityId: job.id,
          viewCount: job.viewCount,
          browserId: args.browserId || createNewBrowserId(),
          eventType: args.type
        })
      }
    }
  }
}
