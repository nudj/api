const { handleErrors } = require('../../lib')
const { values: hirerTypes } = require('../enums/hirer-types')
const {
  send,
  teammateInvitationEmailBodyTemplate
} = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Company {
      inviteMembers(emailAddresses: [String!]!): Status
    }
  `,
  resolvers: {
    Company: {
      inviteMembers: handleErrors(async (company, args, context) => {
        const { emailAddresses } = args

        if (!emailAddresses.length) {
          throw new Error('No email addresses provided')
        }

        await Promise.all(emailAddresses.map(async email => {
          const person = await context.store.readOneOrCreate({
            type: 'people',
            filters: { email },
            data: { email }
          })
          const hirer = await context.store.readOne({
            type: 'hirers',
            filters: { person: person.id }
          })

          if (!hirer) {
            return context.store.create({
              type: 'hirers',
              data: {
                person: person.id,
                company: company.id,
                onboarded: false,
                type: hirerTypes.MEMBER
              }
            })
          } else if (hirer.company !== company.id) {
            throw new Error(`User with email address "${email}" is already signed up with another company`)
          }

          return hirer
        }))

        const [ sendStatus ] = await Promise.all(emailAddresses.map(email => send({
          from: 'hello@nudj.co',
          to: `${email}`,
          subject: 'Welcome to Nudj!',
          html: teammateInvitationEmailBodyTemplate
        })))

        return sendStatus
      })
    }
  }
}
