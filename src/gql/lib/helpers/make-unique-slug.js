const pick = require('lodash/pick')
const {
  SLUG_GENERATORS,
  SLUG_FILTER_BY
} = require('../constants')

const makeUniqueSlug = async ({
  type,
  data,
  context
}) => {
  const makeSlug = SLUG_GENERATORS[type]
  const filterBy = SLUG_FILTER_BY[type] || []
  const filters = pick(data, filterBy)

  filters.slug = makeSlug(data)
  let slugExists = await context.store.readOne({
    type,
    filters
  })

  while (slugExists) {
    filters.slug = makeSlug(data, true)
    slugExists = await context.store.readOne({
      type,
      filters
    })
  }

  return filters.slug
}

module.exports = makeUniqueSlug
