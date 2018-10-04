async function up ({ db, step }) {
  await step('Create intros collection', async () => {
    try {
      const collection = db.collection('intros')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove intros collection', async () => {
    try {
      const collection = db.collection('intros')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'intros'`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
