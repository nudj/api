const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Set `company.syncing` to false on each company', async () => {
    const collection = db.collection('companies')
    const companies = await fetchAll(db, 'companies')

    await Promise.all(companies.map(company => {
      if (!company.syncing) { // Don't update companies that are currently syncing
        return collection.update(company, { syncing: false })
      }
    }))
  })
}

async function down ({ db, step }) {
  await step('Remove `company.syncing` from each company', async () => {
    const collection = db.collection('companies')
    const companies = await fetchAll(db, 'companies')

    await Promise.all(companies.map(company => {
      if (!company.syncing) { // Don't update companies that are currently syncing
        return collection.update(company, { syncing: null }, { keepNull: false })
      }
    }))
  })
}

module.exports = { up, down }
