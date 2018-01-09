module.exports = {
  typeDefs: `
    extend type Person {
      updateTaskByFilters(filters: PersonTaskFilterInput!, data: PersonTaskUpdateInput!): PersonTask
    }
  `,
  resolvers: {
    Person: {
      updateTaskByFilters: (person, args, context) => {
        return context.transaction((store, params) => {
          const { person, filters, data } = params
          return store.readOne({
            type: 'personTasks',
            filters: Object.assign({}, filters, { person })
          })
          .then(task => {
            if (!task) {
              return null
            }
            return store.update({
              type: 'personTasks',
              id: task.id,
              data
            })
          })
        }, {
          person: person.id,
          filters: args.filters,
          data: args.data
        })
      }
    }
  }
}
