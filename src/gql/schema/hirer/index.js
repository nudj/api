module.exports = {
  typeDefs: `
    type Hirer {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input HirerFilterInput {
      id: ID
    }
  `
}
