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
      signedUp: Boolean
    }

    input PersonFilterInput {
      id: ID
      email: String
      signedUp: Boolean
      dateTo: DateTime
      dateFrom: DateTime
    }

    input PersonCreateInput {
      email: String!
      firstName: String!
      lastName: String!
      url: String
      company: String
      role: String
      signedUp: Boolean
    }

    input PersonUpdateInput {
      email: String
      firstName: String
      lastName: String
      url: String
      emailPreference: EmailPreference
      company: String
      role: String
      signedUp: Boolean
    }
  `
}
