module.exports = {
  typeDefs: `
    type Company {
      id: ID!
      created: DateTime!
      modified: DateTime!
      name: String!
      slug: String!
      description: String
      mission: String
      facebook: String
      industry: String
      linkedin: String
      location: String
      logo: String
      size: String
      twitter: String
      url: String
      onboarded: Boolean!
      client: Boolean
    }

    input CompanyCreateInput {
      name: String
      slug: String
      description: String
      mission: String
      facebook: String
      industry: String
      linkedin: String
      location: String
      logo: String
      size: String
      twitter: String
      url: String
      onboarded: Boolean
      client: Boolean
    }

    input CompanyFilterInput {
      id: ID
      slug: String
      client: Boolean
    }
  `
}
