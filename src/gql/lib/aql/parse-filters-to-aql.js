const parseFiltersToAql = (filters = {}) => {
  const keys = Object.keys(filters)
  if (!keys.length) return ''
  return `FILTER ${keys.map((key) => {
    return `item.${key} == @${key}`
  }).join(' && ')}`
}

module.exports = parseFiltersToAql
