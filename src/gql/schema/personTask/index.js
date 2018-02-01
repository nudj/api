module.exports = {
  typeDefs: `
    type PersonTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
      type: TaskType!
    }

    input PersonTaskFilterInput {
      id: ID
      completed: Boolean
      type: TaskType
      dateTo: DateTime
      dateFrom: DateTime
    }

    input PersonTaskUpdateInput {
      completed: Boolean
    }
  `
}
