async function up ({ db, step }) {
  await step('Add accessRequests collection', async () => {
    const accessRequestsCollection = db.collection('accessRequests')
    try {
      await accessRequestsCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  const errorMessages = [
    'unknown collection \'accessRequests\'',
    'collection not found (accessRequests)'
  ]

  try {
    const accessRequestsCollection = db.collection('accessRequests')
    await accessRequestsCollection.drop()
  } catch (error) {
    if (!errorMessages.includes(error.message)) {
      throw error
    }
  }
}

module.exports = { up, down }
