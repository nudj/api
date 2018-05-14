const dedent = require('dedent')
const differenceBy = require('lodash/differenceBy')

const { fetchAll } = require('../../lib')

async function action ({ db, noSQL }) {
  const [
    companies,
    enrichedCompanies
  ] = await Promise.all([
    fetchAll(db, 'companies'),
    fetchAll(noSQL, 'enrichedCompanies')
  ])

  const diff = differenceBy(companies, enrichedCompanies, '_key')

  const message = dedent(`
    ${companies.length} companies in db:
      - ${enrichedCompanies.length} enriched
      - ${diff.length} unenriched
  `)

  console.log(message)
}

module.exports = action
