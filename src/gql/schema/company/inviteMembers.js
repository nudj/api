const { handleErrors } = require('../../lib')
const { values: hirerTypes } = require('../enums/hirer-types')
const {
  send,
  sendInternalEmail,
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
            await sendInternalEmail({
              subject: 'Teammate invitation failed',
              html: `A hirer for ${company.name} attempted to add a teammate with the email address "${email}", but that email address is already related to a different company with id: "${hirer.company}"`
            })
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
