const { GraphQLScalarType } = require('graphql')

module.exports = {
  typeDef: 'scalar DateTime',
  resolver: new GraphQLScalarType({
    name: 'DateTime',
    description: 'Graphcool DateTime emulated type',
    serialize: value => value,
    parseValue: value => value,
    parseLiteral: ast => ast.value
  })
}
