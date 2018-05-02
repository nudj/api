module.exports = {
  typeDefs: `
    extend type Person {
      incompleteTaskCount: Int!
    }
  `,
  resolvers: {
    Person: {
      incompleteTaskCount: async (person, args, context) => {
        const hirer = await context.sql.readOne({
          type: 'hirers',
          filters: { person: person.id }
        })
        const tasks = await Promise.all([
          context.sql.readAll({
            type: 'companyTasks',
            filters: { company: hirer.company, completed: false }
          }),
          context.sql.readAll({
            type: 'personTasks',
            filters: { person: person.id, completed: false }
          })
        ])

        return Promise.resolve([].concat(...tasks).length)
      }
    }
  }
}
