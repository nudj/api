const find = require('lodash/find')
const { ValidationError } = require('@nudj/library/errors')
const { ALREADY_EXISTS } = require('@nudj/library/lib/errors/constants')

async function validateCompanyCreation (company, context) {
  const companies = await context.sql.readAll({
    type: 'companies',
    filters: { client: true }
  })
  const existingCompany = find(companies, clientCompany => {
    return clientCompany.name.toLowerCase() === company.name.toLowerCase()
  })

  if (existingCompany) {
    throw new ValidationError({
      errors: [{
        type: ALREADY_EXISTS,
        value: company.name,
        field: 'name',
        identifier: existingCompany.id
      }]
    })
  }
}

module.exports = { validateCompanyCreation }
