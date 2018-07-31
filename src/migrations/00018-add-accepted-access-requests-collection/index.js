async function up ({ db, step }) {
  await step('Add acceptedAccessRequests collection', async () => {
    const acceptedAccessRequestsCollection = db.collection('acceptedAccessRequests')
    try {
      await acceptedAccessRequestsCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  const errorMessages = [
    'unknown collection \'acceptedAccessRequests\'',
    'collection not found (acceptedAccessRequests)'
  ]

  try {
    const acceptedAccessRequestsCollection = db.collection('acceptedAccessRequests')
    await acceptedAccessRequestsCollection.drop()
  } catch (error) {
    if (!errorMessages.includes(error.message)) {
      throw error
    }
  }
}

module.exports = { up, down }
