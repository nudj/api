module.exports = {
  typeDefs: `
    type Referral {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input ReferralFilterInput {
      id: ID
      person: ID
      job: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
