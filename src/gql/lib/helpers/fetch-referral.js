const { TABLES, INDICES } = require('../../../lib/sql')

// matches MD5 hash format
const isMD5 = id => id.match(/^[a-f0-9]{32}$/)

// matches numbers of length 5-8 that don't start with 0
const mightBeArangoId = id => id.match(/^[1-9][0-9]{4,7}$/)

const fetchReferral = async (context, id) => {
  if (!id) return null
  let slugMap

  if (isMD5(id) || mightBeArangoId(id)) {
    slugMap = await context.sql.readOne({
      type: 'referralKeyToSlugMaps',
      index: INDICES[TABLES.REFERRAL_KEY_TO_SLUG_MAP].referralKey,
      key: id
    })
  }

  const result = await context.sql.readOne({
    type: 'referrals',
    index: INDICES[TABLES.REFERRALS].slug,
    key: (slugMap && slugMap.slug) || id
  })

  return result
}

module.exports = fetchReferral
