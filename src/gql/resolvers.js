const { GraphQLScalarType } = require('graphql')
const store = require('./store')

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Graphcool DateTime emulated type',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value
})

module.exports = {
  Query: {
    referralDepth: (obj, args, context) => {
      let count = null
      function fetchReferral (id) {
        return store.one({ type: 'referrals', id }).then(referral => {
          count = count === null ? 0 : count + 1
          if (referral.fromReferral) {
            return fetchReferral(referral.fromReferral)
          } else {
            return count
          }
        })
      }
      return fetchReferral(args.id)
    }
  },
  DateTime
}
