const { graphql } = require('graphql')
const chai = require('chai')
const curry = require('lodash/curry')
const expect = chai.expect

const { transaction, store } = require('../../../gql/adaptors/lodash')

const createTestContext = db => ({
  web: {
    protocol: 'https',
    hostname: process.env.WEB_HOSTNAME
  },
  hire: {
    protocol: 'https',
    hostname: process.env.HIRE_HOSTNAME
  },
  userId: 'person1',
  transaction: transaction({ db }),
  store: store({ db }),
  nosql: store({ db })
})

function executeQueryOnDbUsingSchema ({ schema, variables = {}, operation, db }) {
  const testContext = createTestContext(db)
  return graphql(schema, operation, undefined, testContext, variables)
}

const expectPropertyReceivesValue = curry(async (schema, type, typePlural, property, value) => {
  const db = {
    [typePlural]: [
      {
        [property]: value
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async operationType => {
    const operation = `
      ${operationType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    expect(result, `Expected "${type}" schema to include "${property}" property`).to.deep.equal({
      data: {
        [typePlural]: [
          {
            [property]: value
          }
        ]
      }
    })
  }))
})

const expectTypeIsFilterableBy = (schema, type, typePlural) => async (property, value, valueType) => {
  const db = {
    [typePlural]: [
      {
        id: 123,
        [property]: value
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async operationType => {
    const operation = `
      ${operationType} filterable ($value: ${valueType}!) {
        ${typePlural}ByFilters(filters: {
          ${property}: $value
        }) {
          id
        }
      }
    `
    const variables = { value }
    const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    shouldNotRespondWithGqlError({
      response: `Expected type ${type} to be filterable by property ${property}`
    })(result)
  }))
}

const shouldRespondWithGqlError = ({ path, response, message }) => result => {
  const messageExpecation = expect(result, response).to.have.deep.property('errors[0].message')
  if (message) {
    messageExpecation.to.equal(message)
  }
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal(path)
}

const shouldNotRespondWithGqlError = ({ response }) => result => {
  expect(result, response).to.not.have.deep.property('errors')
}

const expectPropertyIsRequired = curry(async (schema, type, typePlural, property) => {
  const db = {
    [typePlural]: [
      {
        [property]: null
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async operationType => {
    const operation = `
      ${operationType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: `Cannot return null for non-nullable field ${type}.${property}.`,
        path: [
          typePlural,
          0,
          property
        ],
        response: `Property "${property}" should be required`
      }))
  }))
})

const expectPropertyContentsIsRequired = curry(async (schema, type, typePlural, property) => {
  const db = {
    [typePlural]: [
      {
        [property]: [null]
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async operationType => {
    const operation = `
      ${operationType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: `Cannot return null for non-nullable field ${type}.${property}.`,
        path: [
          typePlural,
          0,
          property,
          0
        ],
        response: `Property contents "${property}" should be required`
      }))
  }))
})

function generateFakeContextWithStore (store) {
  return {
    transaction: (action, params) => {
      return action(store, params)
    },
    store
  }
}

module.exports = {
  createTestContext,
  executeQueryOnDbUsingSchema,
  expectPropertyReceivesValue,
  expectTypeIsFilterableBy,
  expectPropertyIsRequired,
  expectPropertyContentsIsRequired,
  shouldRespondWithGqlError,
  generateFakeContextWithStore
}
