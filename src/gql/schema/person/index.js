module.exports = {
  typeDefs: `
    type Person {
      id: ID!
      created: DateTime!
      modified: DateTime!
      email: String!
      firstName: String
      lastName: String
      url: String
      emailPreference: EmailPreference
    }

    input PersonFilterInput {
      id: ID
      email: String
    }

    input PersonUpdateInput {
      email: String
      firstName: String
      lastName: String
      url: String
      emailPreference: EmailPreference
    }
  `
}
