const omit = require('lodash/omit')
const differenceBy = require('lodash/differenceBy')

const { fetchAll } = require('../../lib')
const { enrichCompanyByName } = require('../../gql/lib/clearbit')

// Setting the default relatively low to avoid accidental mass-enrichment
const DEFAULT_ENRICHMENT_AMOUNT = 50

async function enrichAndStoreCompany (company, noSQL) {
  try {
    const companyData = await enrichCompanyByName(company.name)

    let data
    if (companyData) {
      data = {
        ...omit(companyData, ['id']), // omit Clearbit ID
        _key: company._key,
        clearbitId: companyData.id,
        name: company.name
      }
    } else {
      // Store company to record attempted enrichment - nothing returned
      data = {
        _key: company._key,
        name: company.name
      }
    }

    const collection = noSQL.collection('enrichedCompanies')
    return collection.save(data)
  } catch (error) {
    console.error('Enrichment error', error)
    return null
  }
}

async function action ({ db, noSQL, arg: specifiedAmount }) {
  const [
    companies,
    enrichedCompanies
  ] = await Promise.all([
    fetchAll(db, 'companies'),
    fetchAll(noSQL, 'enrichedCompanies')
  ])

  const unenrichedCompanies = differenceBy(companies, enrichedCompanies, '_key')

  let amountToEnrich = DEFAULT_ENRICHMENT_AMOUNT
  if (specifiedAmount && unenrichedCompanies.length >= specifiedAmount) {
    // Amount is specifed and does not exceed number of unenriched companies
    amountToEnrich = specifiedAmount
  } else if (unenrichedCompanies.length < DEFAULT_ENRICHMENT_AMOUNT) {
    // Base enrichment amount exceeds number of unenriched companies
    amountToEnrich = unenrichedCompanies.length
  }

  const companiesToEnrich = unenrichedCompanies.slice(0, amountToEnrich)

  await Promise.all(companiesToEnrich.map(company => {
    return enrichAndStoreCompany(company, noSQL)
  }))
}

module.exports = action
