const uniq = require('lodash/uniq')

const fetchPerson = require('../../lib/helpers/fetch-person')
const {
  send,
  sendJobsEmailBodyTemplate
} = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Company {
      sendJobEmails(recipients: [ID!]!, jobs: [ID!]!): Status
    }
  `,
  resolvers: {
    Company: {
      sendJobEmails: async (company, args, context) => {
        if (!args.recipients.length) throw new Error('No recipients specified')
        if (!args.jobs.length) throw new Error('No jobs specified')

        const [
          recipients,
          jobs,
          person
        ] = await Promise.all([
          context.sql.readMany({
            type: 'people',
            ids: uniq(args.recipients)
          }),
          context.sql.readMany({
            type: 'jobs',
            ids: args.jobs
          }),
          fetchPerson(context, context.userId)
        ])

        const { firstName, lastName } = person
        const senderName = firstName && lastName && `${firstName} ${lastName}`
        const from = senderName
          ? `${senderName} via nudj <hello@nudj.co>`
          : `nudj <hello@nudj.co>`

        const [ sendStatus ] = await Promise.all(
          recipients.map(recipient => send({
            from,
            to: recipient.email,
            subject: 'We\'re hiring! Can you help?',
            html: sendJobsEmailBodyTemplate({
              web: context.web,
              company,
              jobs,
              recipient
            })
          }))
        )

        return sendStatus
      }
    }
  }
}
