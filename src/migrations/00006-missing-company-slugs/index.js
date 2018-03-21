const isNil = require('lodash/isNil')

const getMakeUniqueCompanySlug = require('../../gql/lib/helpers/make-unique-company-slug')

async function up ({ db, step }) {
  await step('Add missing company properties', async () => {
    const collection = db.collection('companies')
    const allCursor = await collection.all()
    const allResults = await allCursor.all()

    const companyMap = allResults.reduce((map, company) => {
      map[company._key] = company
      return map
    }, {})

    const makeUniqueSlug = getMakeUniqueCompanySlug(companyMap)

    await allCursor.each(company => {
      const newProps = {}
      newProps.slug = makeUniqueSlug(company)
      if (isNil(company.onboarded)) newProps.onboarded = false
      if (isNil(company.client)) newProps.client = false

      return collection.update(company, newProps)
    })
  })
}

async function down ({ db, step }) {
  await step('Step 1', async () => {})
}

module.exports = { up, down }
