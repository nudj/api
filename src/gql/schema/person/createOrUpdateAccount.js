module.exports = {
  typeDefs: `
    extend type Person {
      createOrUpdateAccount(type: AccountType!, data: Data!): Account!
    }
  `,
  resolvers: {
    Person: {
      createOrUpdateAccount: (person, args, context) => {
        const { type, data } = args
        return context.transaction((store, params) => {
          const { person, type, data } = params
          return store.readOne({
            type: 'accounts',
            filters: {
              person,
              type
            }
          })
            .then(account => {
              if (account && account.id) {
                return store.update({
                  type: 'accounts',
                  id: account.id,
                  data: {
                    data: Object.assign({}, account.data, data)
                  }
                })
              }
              return store.create({
                type: 'accounts',
                data: {
                  person,
                  type,
                  data
                }
              })
            })
        }, {
          type,
          data,
          person: person.id
        })
      }
    }
  }
}
