const { GraphQLScalarType } = require('graphql')

module.exports = {
  typeDefs: 'scalar Data',
  resolvers: {
    Data: new GraphQLScalarType({
      name: 'Data',
      description: 'Data emulated type',
      serialize: value => value,
      parseValue: value => value,
      parseLiteral: ast => ast.value
    })
  }
}
