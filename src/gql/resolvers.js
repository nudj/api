const { GraphQLScalarType } = require('graphql')

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Graphcool DateTime emulated type',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value
})

const Data = new GraphQLScalarType({
  name: 'Data',
  description: 'Data emulated type',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value
})

module.exports = ({ store }) => ({
  Query: {
    referralDepth: (obj, args, context) => {
      let count = null
      function fetchReferral (id) {
        return store.readOne({ type: 'referrals', id }).then(referral => {
          count = count === null ? 0 : count + 1
          if (referral.parent) {
            return fetchReferral(referral.parent)
          } else {
            return count
          }
        })
      }
      return fetchReferral(args.id)
    }
  },
  Mutation: {
    createReferral: (obj, args, context) => {
      const { parent, person, job } = args.input
      return store.readOne({
        type: 'referrals',
        filters: { person, job }
      })
      .then(referral => {
        if (referral) throw new Error('Already referred')
        return store.create({
          type: 'referrals',
          data: { parent, person, job }
        })
      })
    },
    createApplication: (obj, args, context) => {
      const { referral, person, job } = args.input
      return store.readOne({
        type: 'applications',
        filters: { person, job }
      })
      .then(application => {
        if (application) throw new Error('Already applied')
        return store.create({
          type: 'applications',
          data: { referral, person, job }
        })
      })
    }
  },
  DateTime,
  Data
})
