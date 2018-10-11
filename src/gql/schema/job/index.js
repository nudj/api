module.exports = {
  typeDefs: `
    type Job {
      id: ID!
      created: DateTime!
      modified: DateTime!
      title: String!
      slug: String!
      description: String
      bonus: String
      roleDescription: String
      candidateDescription: String
      location: String!
      remuneration: String
      status: JobStatus!
      templateTags: [String!]!
      type: String!
      url: String
      experience: String
      labels: [String!]
      requirements: String
    }

    input JobCreateInput {
      title: String!
      slug: String
      description: String!
      bonus: String
      location: String!
      remuneration: String
      status: JobStatus!
      templateTags: [String!]!
      type: String!
      url: String
      experience: String
      requirements: String
      labels: [String!]
      relatedJobs: [ID!]
      tags: [ExpertiseTagType!]
    }

    input JobUpdateInput {
      title: String
      slug: String
      description: String
      bonus: String
      roleDescription: String
      candidateDescription: String
      location: String
      remuneration: String
      status: JobStatus
      templateTags: [String!]
      type: String
      url: String
      experience: String
      requirements: String
      labels: [String!]
      relatedJobs: [ID!]
      tags: [ExpertiseTagType!]
    }

    input JobFilterInput {
      id: ID
      slug: String
      status: JobStatus
      dateTo: DateTime
      dateFrom: DateTime
      company: ID
    }
  `
}
