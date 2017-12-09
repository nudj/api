module.exports = {
  typeDefs: `
    type Employee {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input EmployeeFilterInput {
      id: ID
    }
  `
}
