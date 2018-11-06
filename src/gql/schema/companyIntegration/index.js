module.exports = {
  typeDefs: `
    type CompanyIntegration {
      id: ID!
      created: DateTime!
      modified: DateTime!
      data: Data!
      type: CompanyIntegrationType!
    }

    input CompanyIntegrationFilterInput {
      id: ID
      type: String
    }
  `
}
