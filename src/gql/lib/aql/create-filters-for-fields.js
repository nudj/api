const { plural } = require('pluralize')
const uniqueId = require('lodash/uniqueId')
const find = require('lodash/find')

const fetchCollectionName = (field, fieldAliases) => {
  if (!fieldAliases) return plural(field)

  const alias = find(fieldAliases, (alias) => alias[field])
  const collectionName = alias ? alias[field] : field
  return plural(collectionName)
}

const recursivelyFetchNestedValues = (
  fields,
  fieldAliases,
  accumulatedQuery = '',
  previousKey = 'item'
) => {
  if (!fields.length) return accumulatedQuery

  const [field, ...remainingFields] = fields
  const collection = fetchCollectionName(field, fieldAliases)
  const variableId = uniqueId(collection)

  // Set prefix to either assign intermediate values or return final value
  const prefix = remainingFields.length ? `LET ${variableId} =` : 'RETURN'

  // Set key as the current field being accessed on the previously fetched value
  const key = `${previousKey}.${field}`

  // Check if nested value is collection key, otherwise fallback to
  // accessing value directly
  const query = `
    ${accumulatedQuery}
    ${prefix} DOCUMENT("${collection}", ${key}) || ${key}
  `

  return recursivelyFetchNestedValues(remainingFields, fieldAliases, query, variableId)
}

const createFiltersForFields = (fieldGroup, queryName, fieldAliases) => {
  const nestedValues = fieldGroup.map(field => {
    if (!field.includes('.')) return `item.${field}`

    const fields = field.split('.')
    return recursivelyFetchNestedValues(fields, fieldAliases)
  })

  return `
    FILTER (
      CONTAINS(
        LOWER(CONCAT_SEPARATOR(" ", ${nestedValues})), LOWER(@${queryName})
      )
    )
  `
}

module.exports = createFiltersForFields
