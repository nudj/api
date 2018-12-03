const pick = require('lodash/pick')
const {
  SLUG_GENERATORS,
  SLUG_FILTER_BY
} = require('../../../lib/sql')

const makeUniqueSlug = async ({
  type,
  data,
  context
}) => {
  const { generator } = SLUG_GENERATORS[type]
  const filterBy = SLUG_FILTER_BY[type] || []
  const filters = pick(data, filterBy)

  filters.slug = generator(data)
  let existingRecord = await context.sql.readOne({
    type,
    filters
  })

  while (existingRecord && `${existingRecord.id}` !== `${data.id}`) {
    filters.slug = generator(data, true)
    existingRecord = await context.sql.readOne({
      type,
      filters
    })
  }

  return filters.slug
}

module.exports = makeUniqueSlug
