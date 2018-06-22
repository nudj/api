const { SLUG_GENERATORS } = require('../../../lib/sql')

const makeUniqueSlug = async ({ type, data, context }) => {
  const { generator } = SLUG_GENERATORS[type]
  let slug = generator(data)

  let existingRecord = await context.sql.readOne({
    type,
    filters: { slug }
  })

  while (existingRecord && `${existingRecord.id}` !== `${data.id}`) {
    slug = generator(data, true)
    existingRecord = await context.sql.readOne({
      type,
      filters: { slug }
    })
  }

  return slug
}

module.exports = makeUniqueSlug
