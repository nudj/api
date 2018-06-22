const omit = require('lodash/omit')

const { values: dataSources } = require('../../schema/enums/data-sources')
const { enrichOrFetchEnrichedCompanyByName } = require('../clearbit')
const getMakeUniqueCompanySlug = require('./make-unique-company-slug')

module.exports = async (context, personData) => {
  const { company: companyName, role: roleName } = personData

  const person = await context.sql.create({
    type: 'people',
    data: omit(personData, ['company', 'role'])
  })

  if (companyName) {
    let company = await context.sql.readOne({
      type: 'companies',
      filters: { name: companyName }
    })

    if (!company) {
      const allCompanies = await context.sql.readAll({
        type: 'companies'
      })
      const makeSlug = getMakeUniqueCompanySlug(allCompanies)
      company = await context.sql.create({
        type: 'companies',
        data: {
          name: companyName,
          client: false,
          slug: makeSlug({ name: companyName })
        }
      })
      enrichOrFetchEnrichedCompanyByName(company, context)
    }

    const employment = await context.sql.create({
      type: 'employments',
      data: {
        person: person.id,
        company: company.id,
        source: dataSources.NUDJ
      }
    })

    await context.sql.create({
      type: 'currentEmployments',
      data: {
        person: person.id,
        employment: employment.id
      }
    })
  }

  if (roleName) {
    const role = await context.sql.readOneOrCreate({
      type: 'roles',
      filters: { name: roleName },
      data: { name: roleName }
    })

    const personRole = await context.sql.create({
      type: 'personRoles',
      data: {
        person: person.id,
        role: role.id,
        source: dataSources.NUDJ
      }
    })

    await context.sql.create({
      type: 'currentPersonRoles',
      data: {
        person: person.id,
        personRole: personRole.id
      }
    })
  }

  return person
}
