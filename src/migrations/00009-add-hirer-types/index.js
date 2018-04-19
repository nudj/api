const { values: hirerTypes } = require('../../gql/schema/enums/hirer-types')

async function up ({ db, step }) {
  await step('Add `type` property to existing hirers with value `ADMIN`', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirers = await hirersCollection.all()

    await allHirers.each(async hirer => {
      return hirersCollection.update(hirer, {
        type: hirerTypes.ADMIN
      })
    })
  })
}

async function down ({ db, step }) {
  await step('Remove `type` property from hirers', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirers = await hirersCollection.all()

    await allHirers.each(async hirer => {
      return hirersCollection.update(hirer, {
        type: null
      }, { keepNull: false })
    })
  })
}

module.exports = { up, down }
