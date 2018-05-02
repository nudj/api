const { SLUG_GENERATORS } = require('../../../lib/sql')

const makeUniqueSlug = async ({ type, data, context }) => {
  const { generator } = SLUG_GENERATORS[type]
  let slug = generator(data)

  let slugExists = await context.sql.readOne({
    type,
    filters: { slug }
  })

  while (slugExists) {
    slug = generator(data, true)
    slugExists = await context.sql.readOne({
      type,
      filters: { slug }
    })
  }

  return slug
}

module.exports = makeUniqueSlug
