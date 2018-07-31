async function up ({ db, step }) {
  await step('Add acceptAccessRequests collection', async () => {
    const acceptAccessRequestsCollection = db.collection('acceptAccessRequests')
    try {
      await acceptAccessRequestsCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  const errorMessages = [
    'unknown collection \'acceptAccessRequests\'',
    'collection not found (acceptAccessRequests)'
  ]

  try {
    const acceptAccessRequestsCollection = db.collection('acceptAccessRequests')
    await acceptAccessRequestsCollection.drop()
  } catch (error) {
    if (!errorMessages.includes(error.message)) {
      throw error
    }
  }
}

module.exports = { up, down }
