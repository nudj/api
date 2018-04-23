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
      company: String
    }

    input PersonFilterInput {
      id: ID
      email: String
      dateTo: DateTime
      dateFrom: DateTime
    }

    input PersonCreateInput {
      email: String!
      firstName: String!
      lastName: String!
      url: String
      company: String
    }

    input PersonUpdateInput {
      email: String
      firstName: String
      lastName: String
      url: String
      emailPreference: EmailPreference
      company: String
    }
  `
}
