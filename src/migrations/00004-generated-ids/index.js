const { parse, printSchema } = require('graphql')
const omit = require('lodash/omit')
const upperFirst = require('lodash/upperFirst')
const camelCase = require('lodash/camelCase')
const {
  plural: pluralise,
  singular: singularise
} = require('pluralize')
const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/lib/constants')

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

async function updateIdsForCollectionInDb (collection, db) {
  const type = upperFirst(singularise(collection))

  // generate new id for every document in collection
  const cursorCollection = db.collection(collection)
  const cursorAll = await cursorCollection.all()
  const all = await cursorAll.all()
  const idMaps = await Promise.all(all.map(async item => {
    const newId = generateId(idTypes.COMPANY, item)
    await cursorCollection.remove(item._key)
    await cursorCollection.save({
      ...omit(item, ['_id', '_key', '_rev']),
      _key: newId
    })
    // return mapping of old to new id
    return { [item._key]: newId }
  }))
  // compose all mappings into a single id map
  const idMap = Object.assign({}, ...idMaps)

  // update relations with new ids
  const typeLocations = findTypeLocationsInSchema(type, schema)
  await Promise.all(typeLocations.map(async typeLocation => {
    const {
      type: relationType,
      field: relationField,
      many: relationMany
    } = typeLocation
    const relationCollection = pluralise(camelCase(relationType))
    const relationCursorCollection = db.collection(relationCollection)
    const relationCursorAll = await relationCursorCollection.all()
    await relationCursorAll.each(async doc => {
      if (doc[relationField]) {
        let value
        if (relationMany) {
          value = doc[relationField].map(item => idMap[item])
        } else {
          value = idMap[doc[relationField]]
        }
        await relationCursorCollection.update(doc, {
          [relationField]: value
        })
      }
    })
  }))

  // update events with new ids
  const eventCursorCollection = db.collection('events')
  const eventCursorAll = await eventCursorCollection.all()
  await eventCursorAll.each(async doc => {
    if (doc.entityType === collection) {
      await eventCursorCollection.update(doc, {
        entityId: idMap[doc.entityId]
      })
    }
  })
}

async function up ({ db, step }) {
  try {
    await step('companies', () => updateIdsForCollectionInDb('companies', db))
    await step('jobs', () => updateIdsForCollectionInDb('jobs', db))
    await step('people', () => updateIdsForCollectionInDb('people', db))
    await step('connections', () => updateIdsForCollectionInDb('connections', db))
    await step('surveyQuestions', () => updateIdsForCollectionInDb('surveyQuestions', db))
    await step('roles', () => updateIdsForCollectionInDb('roles', db))
    await step('surveys', () => updateIdsForCollectionInDb('surveys', db))
    await step('surveyAnswers', () => updateIdsForCollectionInDb('surveyAnswers', db))
    await step('surveySections', () => updateIdsForCollectionInDb('surveySections', db))
    await step('accounts', () => updateIdsForCollectionInDb('accounts', db))
    await step('applications', () => updateIdsForCollectionInDb('applications', db))
    await step('conversations', () => updateIdsForCollectionInDb('conversations', db))
    await step('employees', () => updateIdsForCollectionInDb('employees', db))
    await step('employments', () => updateIdsForCollectionInDb('employments', db))
    await step('events', () => updateIdsForCollectionInDb('events', db))
    await step('messages', () => updateIdsForCollectionInDb('messages', db))
    await step('recommendations', () => updateIdsForCollectionInDb('recommendations', db))
    await step('referrals', () => updateIdsForCollectionInDb('referrals', db))
  } catch (error) {
    console.log(error.message)
  }
}

async function down ({ db, step }) {
  await step('Step 1', async () => {

  })
}

module.exports = { up, down }
