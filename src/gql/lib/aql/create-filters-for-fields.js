const pluralize = require('pluralize')
const uniqueId = require('lodash/uniqueId')

const recursivelyFetchNestedValues = (
  fields,
  accumulatedQuery = '',
  previousKey = 'item'
) => {
  if (!fields.length) return accumulatedQuery

  const [field, ...remainingFields] = fields
  const collection = pluralize.plural(field)
  const variableId = uniqueId(field)

  // Set prefix to either assign intermediate values or return final value
  const prefix = remainingFields.length ? `LET ${variableId} =` : 'RETURN'

  // Set key as the current field being accessed on the previously fetched value
  const key = `${previousKey}.${field}`

  // Check if nested value is collection key, otherwise fallback to
  // accessing value directly
  const query = `
    ${accumulatedQuery}
    ${prefix} DOCUMENT(CONCAT("${collection}/", ${key})) || ${key}
  `

  return recursivelyFetchNestedValues(remainingFields, query, variableId)
}

const createFiltersForFields = (fieldGroup) => {
  const nestedValues = fieldGroup.map(field => {
    if (!field.includes('.')) return `item.${field}`

    const fields = field.split('.')
    return recursivelyFetchNestedValues(fields)
  })

  return `
    FILTER (
      CONTAINS(
        LOWER(CONCAT_SEPARATOR(" ", ${nestedValues})), LOWER(@query)
      )
    )
  `
}

module.exports = createFiltersForFields
