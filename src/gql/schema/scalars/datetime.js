const { GraphQLScalarType } = require('graphql')

module.exports = {
  typeDefs: 'scalar DateTime',
  resolvers: {
    DateTime: new GraphQLScalarType({
      name: 'DateTime',
      description: 'Graphcool DateTime emulated type',
      serialize: value => value,
      parseValue: value => value,
      parseLiteral: ast => ast.value
    })
  }
}
