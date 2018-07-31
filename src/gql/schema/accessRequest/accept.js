const { AppError } = require('@nudj/library/errors')
const { values: hirerTypes } = require('../enums/hirer-types')
const {
  send,
  requestAcceptedEmailBodyTemplate
} = require('../../lib/mailer')
const { INTERNAL_EMAIL_ADDRESS } = require('../../lib/constants')

module.exports = {
  typeDefs: `
    extend type AccessRequest {
      accept: Boolean
    }
  `,
  resolvers: {
    AccessRequest: {
      accept: async (accessRequest, args, context) => {
        const { userId } = context
        const [
          acceptedAccessRequest,
          user,
          userHirer,
          person,
          company
        ] = await Promise.all([
          context.sql.readOne({
            type: 'acceptedAccessRequests',
            filters: {
              accessRequest: accessRequest.id
            }
          }),
          context.sql.readOne({
            type: 'people',
            id: userId
          }),
          context.sql.readOne({
            type: 'hirers',
            filters: {
              person: userId
            }
          }),
          context.sql.readOne({
            type: 'people',
            id: accessRequest.person
          }),
          context.sql.readOne({
            type: 'companies',
            id: accessRequest.company
          })
        ])
        if (acceptedAccessRequest) throw new AppError('Request has already been accepted')
        if (!user) throw new AppError('User not found')
        if (!userHirer) throw new AppError(`Hirer for user (${user.id}) not found`)
        if (userHirer.type !== hirerTypes.ADMIN) throw new AppError(`Hirer (${userHirer.id}) for user (${user.id}) is not an admin`)
        if (!person) throw new AppError(`Person (${accessRequest.person}) not found`)
        if (!company) throw new AppError(`Company (${accessRequest.company}) not found`)

        // create new hirer for accepted person
        await context.sql.create({
          type: 'hirers',
          data: {
            company: accessRequest.company,
            person: accessRequest.person,
            type: hirerTypes.MEMBER
          }
        })

        // sql acceptedAccessRequest against the user's hirer
        await context.sql.create({
          type: 'acceptedAccessRequests',
          data: {
            accessRequest: accessRequest.id,
            hirer: userHirer.id
          }
        })

        // send email to new hirer
        await send({
          from: INTERNAL_EMAIL_ADDRESS,
          to: person.email,
          subject: `${user.firstName} ${user.lastName} has accepted your request`,
          html: requestAcceptedEmailBodyTemplate({
            hire: context.hire,
            web: context.web,
            recipient: person,
            acceptedBy: user,
            company
          })
        })

        return true
      }
    }
  }
}
