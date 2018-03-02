module.exports = {
  typeDefs: `
    type Employment {
      id: ID!
      created: DateTime!
      modified: DateTime!
      source: DataSource!
    }

    input EmploymentFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
      source: DataSource
    }
  `
}
