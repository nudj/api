const collections = [
  'accounts',
  'applications',
  'companies',
  'conversations',
  'hirers',
  'jobs',
  'people',
  'referrals',
  'surveys',
  'surveyMessages',
  'tasks'
]

async function up ({ db, step }) {
  await step('Create collections', async () => {
    await Promise.all(collections.map(async name => {
      try {
        const collection = db.collection(name)
        await collection.create()
      } catch (error) {
        if (error.message !== 'duplicate name: duplicate name') {
          throw error
        }
      }
    }))
  })
}

async function down ({ db, step }) {
  await step('Remove collections', async () => {
    await Promise.all(collections.map(async name => {
      try {
        const collection = db.collection(name)
        await collection.drop()
      } catch (error) {
        if (error.message !== `unknown collection '${name}'`) {
          throw error
        }
      }
    }))
  })
}

module.exports = { up, down }
