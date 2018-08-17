const generateHash = require('hash-generator')
const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Add a hash to all companies', async () => {
    const collection = db.collection('companies')
    const companies = await fetchAll(db, 'companies')
    await Promise.all(companies.map(company => {
      if (!company.hash) {
        collection.update(company, {
          hash: generateHash(128)
        })
      }
    }))
  })
}

async function down ({ db, step }) {
  // I don't know that we can remove the company hashes without removing *all*
  // of them, included the ones that existed prior to the migration.
}

module.exports = { up, down }
