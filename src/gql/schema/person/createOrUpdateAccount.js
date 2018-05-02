const omit = require('lodash/omit')

module.exports = {
  typeDefs: `
    extend type Person {
      createOrUpdateAccount(data: AccountCreateInput!): Account!
    }
  `,
  resolvers: {
    Person: {
      createOrUpdateAccount: async (person, args, context) => {
        const { data } = args
        if (data.data) {
          data.data = JSON.stringify(data.data)
        }
        const account = await context.sql.readOne({
          type: 'accounts',
          filters: {
            person: person.id,
            type: data.type
          }
        })
        if (account && account.id) {
          return context.sql.update({
            type: 'accounts',
            id: account.id,
            data: { ...omit(account, ['id']), ...data }
          })
        }
        return context.sql.create({
          type: 'accounts',
          data: {
            person: person.id,
            ...data
          }
        })
      }
    }
  }
}
