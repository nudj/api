const { parse, printSchema } = require('graphql')
const upperFirst = require('lodash/upperFirst')
const {
  singular: singularise
} = require('pluralize')

const schema = require('../../gql/schema')

function findTypeLocationsInSchema (typeToFind, schema) {
  const ast = parse(printSchema(schema))
  return ast.definitions.reduce((locations, typeDefinition) => {
    const type = typeDefinition.name.value
    if (
      typeDefinition.kind === 'ObjectTypeDefinition' &&
      typeDefinition.name.value !== 'Query' &&
      typeDefinition.name.value !== 'Mutation'
    ) {
      typeDefinition.fields.forEach(fieldDefinition => {
        const field = fieldDefinition.name.value
        let many = false
        while (fieldDefinition.type) {
          if (fieldDefinition.kind === 'ListType') {
            many = true
          }
          fieldDefinition = fieldDefinition.type
        }
        if (fieldDefinition.name.value === typeToFind) {
          locations.push({
            type,
            field,
            many
          })
        }
      })
    }
    return locations
  }, [])
}

const locs = [
  'accounts',
  'applications',
  'companies',
  'conversations',
  'employees',
  'employments',
  'events',
  'jobs',
  'people',
  'recommendations',
  'referrals',
  'roles',
  'surveys',
  'surveyAnswers',
  'surveySections',
  'surveyQuestions',
  'connections'
].reduce((locs, collection) => {
  const type = upperFirst(singularise(collection))
  const locations = findTypeLocationsInSchema(type, schema)
  return locs.concat({
    type,
    locations
  })
}, [])
console.log(JSON.stringify(locs, null, 2))
