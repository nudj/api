module.exports = {
  typeDefs: `
    type Intro {
      id: ID!
      created: DateTime!
      modified: DateTime!
      notes: String
    }

    input IntroCreateInput {
      job: ID!
      person: ID!
      candidate: ID!
      notes: String
    }

    input IntroFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
