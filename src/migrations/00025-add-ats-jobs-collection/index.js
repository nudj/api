async function up ({ db, step }) {
  await step('Create atsJobs collection', async () => {
    try {
      const collection = db.collection('atsJobs')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove atsJobs collection', async () => {
    try {
      const collection = db.collection('atsJobs')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'atsJobs'`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
