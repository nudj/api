module.exports = {
  typeDefs: `
    extend type Person {
      updateTaskByFilters(filters: PersonTaskFilterInput!, data: PersonTaskUpdateInput!): PersonTask
    }
  `,
  resolvers: {
    Person: {
      updateTaskByFilters: async (person, args, context) => {
        const { data, filters } = args
        const task = await context.store.readOne({
          type: 'personTasks',
          filters: Object.assign({}, filters, { person: person.id })
        })
        if (!task) return null

        return context.store.update({
          type: 'personTasks',
          id: task.id,
          data
        })
      }
    }
  }
}
