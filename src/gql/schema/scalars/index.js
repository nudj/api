const DateTime = require('./datetime')

module.exports = {
  typeDefs: [
    DateTime.typeDef
  ],
  resolvers: {
    DateTime: DateTime.resolver
  }
}
