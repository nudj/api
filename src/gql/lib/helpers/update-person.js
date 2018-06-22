const omit = require('lodash/omit')

const { values: dataSources } = require('../../schema/enums/data-sources')
const { enrichOrFetchEnrichedCompanyByName } = require('../clearbit')
const getMakeUniqueCompanySlug = require('./make-unique-company-slug')

module.exports = async (context, id, data) => {
  const { company: companyName, role: roleName } = data

  if (companyName) {
    // Fetch company by name
    let company = await context.sql.readOne({
      type: 'companies',
      filters: { name: companyName }
    })

    // If company does not exist, create it
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

    // read or create employment for person and company
    const employment = await context.sql.readOneOrCreate({
      type: 'employments',
      filters: {
        person: id,
        company: company.id
      },
      data: {
        person: id,
        company: company.id,
        source: dataSources.NUDJ
      }
    })

    const currentEmployment = await context.sql.readOne({
      type: 'currentEmployments',
      filters: {
        person: id
      }
    })

    if (currentEmployment) {
      // ensure existing currentEmployment points to correct employment
      if (currentEmployment.employment !== employment.id) {
        await context.sql.update({
          type: 'currentEmployments',
          id: currentEmployment.id,
          data: {
            employment: employment.id
          }
        })
      }
    } else {
      await context.sql.create({
        type: 'currentEmployments',
        data: {
          person: id,
          employment: employment.id
        }
      })
    }
  }

  if (roleName) {
    const role = await context.sql.readOneOrCreate({
      type: 'roles',
      filters: { name: roleName },
      data: { name: roleName }
    })

    const personRole = await context.sql.readOneOrCreate({
      type: 'personRoles',
      filters: {
        person: id,
        role: role.id
      },
      data: {
        person: id,
        role: role.id,
        source: dataSources.NUDJ
      }
    })

    const currentPersonRole = await context.sql.readOne({
      type: 'currentPersonRoles',
      filters: {
        person: id
      }
    })

    if (currentPersonRole) {
      // ensure existing currentPersonRole points to correct personRole
      if (currentPersonRole.personRole !== personRole.id) {
        await context.sql.update({
          type: 'currentPersonRoles',
          id: currentPersonRole.id,
          data: {
            personRole: personRole.id
          }
        })
      }
    } else {
      await context.sql.create({
        type: 'currentPersonRoles',
        data: {
          person: id,
          personRole: personRole.id
        }
      })
    }
  }

  return context.sql.update({
    type: 'people',
    id,
    data: omit(data, ['company', 'role'])
  })
}
