const { resolver: hirers } = require('./all')

module.exports = {
  Query: {
    hirers
  },
  Mutation: {
    hirers
  },
  Hirer: {}
}
