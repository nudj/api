module.exports = {
  typeDefs: `
    type ConnectionsImportResult {
      people: [Person!]!
      roles: [Role!]!
      companies: [Company!]!
      connections: [Connection!]!
    }
  `
}
