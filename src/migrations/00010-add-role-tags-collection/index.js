async function up ({ db, step }) {
  await step('Create roleTags collection', async () => {
    try {
      const collection = db.collection('roleTags')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove roleTags collection', async () => {
    try {
      const collection = db.collection('roleTags')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'events'`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
