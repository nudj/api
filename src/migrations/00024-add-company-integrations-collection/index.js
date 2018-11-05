async function up ({ db, step }) {
  await step('Create companyIntegrations collection', async () => {
    try {
      const collection = db.collection('companyIntegrations')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove companyIntegrations collection', async () => {
    try {
      const collection = db.collection('companyIntegrations')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'companyIntegrations'`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
