module.exports = {
  typeDefs: `
    extend type Person {
      incompleteTaskCount: Int!
    }
  `,
  resolvers: {
    Person: {
      incompleteTaskCount: (person, args, context) => {
        const personId = person.id
        return context.transaction((store, params) => {
          const { person } = params
          return store.readOne({
            type: 'hirers',
            filters: { person }
          })
          .then(hirer => Promise.all([
            store.readAll({
              type: 'companyTasks',
              filters: { company: hirer.company, completed: false }
            }),
            store.readAll({
              type: 'personTasks',
              filters: { person, completed: false }
            })
          ]))
          .then(tasks => Promise.resolve([].concat(...tasks).length))
        }, {
          person: personId
        })
      }
    }
  }
}
