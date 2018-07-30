const { values: hirerTypes } = require('../enums/hirer-types')
const mailer = require('../../lib/mailer')
const fetchPerson = require('../../lib/helpers/fetch-person')

module.exports = {
  typeDefs: `
    extend type Company {
      createAccessRequest(person: ID!): AccessRequest
    }
  `,
  resolvers: {
    Company: {
      createAccessRequest: async (company, args, context) => {
        const accessRequest = await context.store.create({
          type: 'accessRequests',
          data: {
            company: company.id,
            person: args.person
          }
        })

        const adminHirers = await context.store.readAll({
          type: 'hirers',
          filters: {
            company: company.id,
            type: hirerTypes.ADMIN
          }
        })
        const adminPeople = await context.store.readMany({
          type: 'people',
          ids: adminHirers.map(admin => admin.person)
        })

        const requestee = await fetchPerson(context, args.person)

        await Promise.all(
          adminPeople.map(admin => mailer.sendAccessRequestEmail({
            to: admin.email,
            hire: context.hire,
            requestee,
            requestId: accessRequest.id,
            company
          }))
        )

        return accessRequest
      }
    }
  }
}