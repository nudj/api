const omit = require('lodash/omit')
const upperFirst = require('lodash/upperFirst')
const camelCase = require('lodash/camelCase')
const {
  plural: pluralise,
  singular: singularise
} = require('pluralize')
const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/lib/constants')

const typeLocationsMap = require('./type-locations')

async function updateIdsForCollectionInDb (collection, db) {
  const type = upperFirst(singularise(collection))

  // generate new id for every document in collection
  const cursorCollection = db.collection(collection)
  const cursorAll = await cursorCollection.all()
  const all = await cursorAll.all()
  const idMaps = await Promise.all(all.map(async item => {
    const idType = idTypes[type.toUpperCase()]
    const newId = generateId(idType, item)
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
  const typeLocations = typeLocationsMap.find(item => item.type === type).locations
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
    await step('Kill Ollie', () => {
      const collection = db.collection('people')
      return collection.remove('27643459')
    })

    await step('Remove redundant collections', async () => {
      await Promise.all([
        'assets',
        'employeeSurveys',
        'externalMessages',
        'internalMessages',
        'messages',
        'tokens'
      ].map(async name => {
        try {
          const collection = db.collection(name)
          await collection.drop()
        } catch (error) {
          if (error.message !== `unknown collection '${name}'`) {
            throw error
          }
        }
      }))
    })

    await step('Truncate redundant collections that admin still requires', async () => {
      await Promise.all([
        'recommendations',
        'surveyMessages',
        'tasks'
      ].map(async name => {
        try {
          const collection = db.collection(name)
          await collection.truncate()
        } catch (error) {
          if (error.message !== `unknown collection '${name}'`) {
            throw error
          }
        }
      }))
    })

    await step('Remove ids from accounts data', async () => {
      const accountsCollection = db.collection('accounts')
      const allAccountsCursor = await accountsCollection.all()
      await allAccountsCursor.each(account => accountsCollection.update(account, {
        id: null
      }, {
        keepNull: false
      }))
    })

    await step('accounts', () => updateIdsForCollectionInDb('accounts', db))
    await step('applications', () => updateIdsForCollectionInDb('applications', db))
    await step('companies', () => updateIdsForCollectionInDb('companies', db))
    await step('conversations', () => updateIdsForCollectionInDb('conversations', db))
    await step('employees', () => updateIdsForCollectionInDb('employees', db))
    await step('employments', () => updateIdsForCollectionInDb('employments', db))
    await step('events', () => updateIdsForCollectionInDb('events', db))
    await step('hirers', () => updateIdsForCollectionInDb('hirers', db))
    await step('jobs', () => updateIdsForCollectionInDb('jobs', db))
    await step('people', () => updateIdsForCollectionInDb('people', db))
    await step('roles', () => updateIdsForCollectionInDb('roles', db))
    await step('surveys', () => updateIdsForCollectionInDb('surveys', db))
    await step('surveyAnswers', () => updateIdsForCollectionInDb('surveyAnswers', db))
    await step('surveySections', () => updateIdsForCollectionInDb('surveySections', db))
    await step('surveyQuestions', () => updateIdsForCollectionInDb('surveyQuestions', db))

    await step('connections', () => updateIdsForCollectionInDb('connections', db))
  } catch (error) {
    console.log(error.message)
  }
}

async function down ({ db, step }) {
  await step('Step 1', async () => {

  })
}

module.exports = { up, down }
