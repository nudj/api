const { TABLES, INDICES } = require('../../../lib/sql')

module.exports = {
  typeDefs: `
    extend type Query {
      referralByLegacyId(id: ID): Referral
    }
  `,
  resolvers: {
    Query: {
      referralByLegacyId: async (root, args, context) => {
        const id = args.id
        if (id === undefined) {
          return null
        }
        const slugMap = await context.nosql.readOne({
          type: 'referralKeyToSlugMaps',
          id
        })
        if (!slugMap) return null
        return context.sql.readOne({
          type: 'referrals',
          index: INDICES[TABLES.REFERRALS].slug,
          key: slugMap.slug
        })
      }
    }
  }
}
