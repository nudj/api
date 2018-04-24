const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Person {
      company: Company
    }
  `,
  resolvers: {
    Person: {
      company: handleErrors(async (person, args, context) => {
        const employment = await context.store.readOne({
          type: 'employments',
          filters: {
            person: person.id,
            current: true
          }
        })

        if (!employment) return null

        return context.store.readOne({
          type: 'companies',
          id: employment.company
        })
      })
    }
  }
}
