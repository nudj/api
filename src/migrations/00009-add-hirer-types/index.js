const { values: hirerTypes } = require('../../gql/schema/enums/hirer-types')
const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Add `type` property to existing hirers with value `ADMIN`', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirers = await fetchAll(db, 'hirers')
    await Promise.all(allHirers.map(hirer => hirersCollection.update(hirer, {
      type: hirerTypes.ADMIN
    })))
  })
}

async function down ({ db, step }) {
  await step('Remove `type` property from hirers', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirers = await fetchAll(db, 'hirers')
    await Promise.all(allHirers.map(hirer => hirersCollection.update(hirer, {
      type: null
    }, { keepNull: false })))
  })
}

module.exports = { up, down }
