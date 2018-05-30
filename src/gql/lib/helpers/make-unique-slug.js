const { SLUG_GENERATORS } = require('../constants')

const makeUniqueSlug = async ({ type, data, context }) => {
  const makeSlug = SLUG_GENERATORS[type]
  let slug = makeSlug(data)

  let slugExists = await context.store.readOne({
    type,
    filters: { slug }
  })

  while (slugExists) {
    slug = makeSlug(data, true)
    slugExists = await context.store.readOne({
      type,
      filters: { slug }
    })
  }

  return slug
}

module.exports = makeUniqueSlug
