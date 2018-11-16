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
      hash: String!
      onboarded: Boolean!
      client: Boolean!
      ats: CompanyIntegrationType
      syncing: Boolean!
    }

    input CompanyCreateInput {
      name: String!
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
      client: Boolean!
    }

    input CompanyUpdateInput {
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
      ats: CompanyIntegrationType
      syncing: Boolean
    }

    input CompanyFilterInput {
      id: ID
      slug: String
      hash: String
      client: Boolean
      dateTo: DateTime
      dateFrom: DateTime
      ats: CompanyIntegrationType
    }
  `
}
