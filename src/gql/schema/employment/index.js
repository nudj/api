module.exports = {
  typeDefs: `
    type Employment {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input EmploymentFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
