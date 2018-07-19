const { renderSimpleTemplate } = require('@nudj/library')
const mailer = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Person {
      notifyByEmail(
        subject: String!,
        body: String!,
      ): Status
    }
  `,
  resolvers: {
    Person: {
      notifyByEmail: async (person, args) => {
        return mailer.send({
          from: 'hello@nudj.co',
          to: person.email,
          subject: renderSimpleTemplate({
            template: args.subject,
            data: person,
            brify: () => '',
            splitter: 'somerandomstring'
          })[0].join(''),
          html: renderSimpleTemplate({
            template: args.body,
            data: person,
            brify: () => '',
            splitter: 'somerandomstring'
          })[0].join('')
        })
      }
    }
  }
}
