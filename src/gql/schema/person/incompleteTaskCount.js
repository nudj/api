module.exports = {
  typeDefs: `
    extend type Person {
      incompleteTaskCount: Int!
    }
  `,
  resolvers: {
    Person: {
      incompleteTaskCount: async (person, args, context) => {
        const hirer = await context.store.readOne({
          type: 'hirers',
          filters: { person: person.id }
        })
        const tasks = await Promise.all([
          context.store.readAll({
            type: 'companyTasks',
            filters: { company: hirer.company, completed: false }
          }),
          context.store.readAll({
            type: 'personTasks',
            filters: { person: person.id, completed: false }
          })
        ])

        return Promise.resolve([].concat(...tasks).length)
      }
    }
  }
}
