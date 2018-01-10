module.exports = {
  typeDefs: `
    type Job {
      id: ID!
      created: DateTime!
      modified: DateTime!
      title: String!
      slug: String!
      description: String!
      bonus: Int!
      roleDescription: String!
      candidateDescription: String!
      location: String!
      remuneration: String!
      status: JobStatus!
      templateTags: [String!]!
      type: String!
      url: String!
      experience: String
      requirements: String
    }

    input JobFilterInput {
      id: ID
      slug: String
      status: JobStatus
    }
  `
}
