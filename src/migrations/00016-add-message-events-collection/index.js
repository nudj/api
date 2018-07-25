async function up ({ db, step }) {
  await step('Add messageEvents collection', async () => {
    const messageEventsCollection = db.collection('messageEvents')
    try {
      await messageEventsCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  try {
    const messageEventsCollection = db.collection('messageEvents')
    await messageEventsCollection.drop()
  } catch (error) {
    if (error.message !== 'collection not found (messageEvents)') {
      throw error
    }
  }
}

module.exports = { up, down }
