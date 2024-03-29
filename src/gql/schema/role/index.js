module.exports = {
  typeDefs: `
    type Role {
      id: ID!
      created: DateTime!
      modified: DateTime!
      name: String!
    }

    input RoleFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
