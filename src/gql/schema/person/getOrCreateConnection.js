const omit = require('lodash/omit')
const pick = require('lodash/pick')
const hash = require('hash-generator')

const handleErrors = require('../../lib/handle-errors')
const makeSlug = require('../../lib/helpers/make-slug')
const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')

module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnection(to: ConnectionCreateInput!, source: DataSource!): Connection
    }
  `,
  resolvers: {
    Person: {
      getOrCreateConnection: handleErrors(async (person, args, context) => {
        const from = person.id
        const { to, source } = args

        const savedPerson = await context.store.readOne({
          type: 'people',
          filters: { email: to.email }
        })
        const savedConnection = savedPerson && await context.store.readOne({
          type: 'connections',
          filters: {
            from,
            person: savedPerson.id
          }
        })
        if (savedConnection) {
          return { ...savedConnection, person: savedPerson }
        }

        let existingCompany
        let companySlug

        if (to.company) {
          companySlug = makeSlug(to.company)

          try {
            existingCompany = await context.store.readOne({
              type: 'companies',
              filters: { name: to.company }
            })
          } catch (error) {
            if (error.message !== 'document not found') throw error
          }

          if (!existingCompany) {
            try {
              existingCompany = await context.store.readOne({
                type: 'companies',
                filters: {
                  slug: companySlug
                }
              })
            } catch (error) {
              if (error.message !== 'document not found') throw error
            }

            while (existingCompany && companySlug === existingCompany.slug) {
              companySlug = `${companySlug}-${hash(8)}`

              try {
                existingCompany = await context.store.readOne({
                  type: 'companies',
                  filters: {
                    slug: companySlug
                  }
                })
              } catch (error) {
                if (error.message !== 'document not found') throw error
              }
            }
          }
        }

        const [ personFromConnection, role, company ] = await Promise.all([
          savedPerson || context.store.create({
            type: 'people',
            data: pick(to, ['email'])
          }),
          to.title && context.store.readOneOrCreate({
            type: 'roles',
            filters: { name: to.title },
            data: { name: to.title }
          }),
          (to.company && existingCompany) || (to.company && context.store.create({
            type: 'companies',
            filters: { slug: companySlug },
            data: {
              name: to.company,
              slug: companySlug,
              onboarded: false,
              client: false
            }
          }))
        ])

        if (company && company.name && !existingCompany) {
          enrichOrFetchEnrichedCompanyByName(company, context)
        }

        if (existingCompany) {
          enrichOrFetchEnrichedCompanyByName(existingCompany, context)
        }

        const connection = await context.store.create({
          type: 'connections',
          data: {
            ...omit(to, ['email', 'title']),
            from,
            source,
            role: role ? role.id : null,
            company: company ? company.id : null,
            person: personFromConnection.id
          }
        })

        return {
          ...connection,
          role,
          company,
          person: personFromConnection
        }
      })
    }
  }
}
