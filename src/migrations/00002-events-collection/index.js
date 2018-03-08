async function up ({ db, step }) {
  await step('Create events collection', async () => {
    try {
      const collection = db.collection('events')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove events collection', async () => {
    try {
      const collection = db.collection('events')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'events'`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
