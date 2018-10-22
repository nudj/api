module.exports = {
  typeDefs: `
    type Intro {
      id: ID!
      created: DateTime!
      modified: DateTime!
      consent: Boolean!
      notes: String
    }

    input IntroCreateInput {
      job: ID!
      person: ID!
      candidate: ID!
      consent: Boolean!
      notes: String
    }

    input IntroFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
      job: ID
      person: ID
      candidate: ID
      consent: Boolean
    }
  `
}
