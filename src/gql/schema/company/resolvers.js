const { resolver: companies } = require('./all')
const { resolver: hirers } = require('./properties/hirers')

module.exports = {
  Query: {
    companies
  },
  Mutation: {
    companies
  },
  Company: {
    hirers
  }
}
