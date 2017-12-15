const { graphql } = require('graphql')
const chai = require('chai')
const curry = require('lodash/curry')
const expect = chai.expect

const transaction = require('../../gql/adaptors/lodash')

function executeQueryOnDbUsingSchema ({ schema, variables = {}, operation, db }) {
  const testContext = { transaction: transaction({ db }) }
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

const expectTypeIsFilterableBy = curry(async (schema, type, typePlural, property, value) => {
  const db = {
    [typePlural]: [
      {
        [property]: value
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async operationType => {
    let valueForQuery = value
    if (typeof value === 'string') {
      valueForQuery = `"${value}"`
    }
    const operation = `
      ${operationType} {
        ${typePlural}ByFilters(filters: {
          ${property}: ${valueForQuery}
        }) {
          ${property}
        }
      }
    `
    const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    expect(result, `Expected "${operationType}.${typePlural}ByFilters" to be filterable by "${property}" property`).to.deep.equal({
      data: {
        [`${typePlural}ByFilters`]: [
          {
            [property]: value
          }
        ]
      }
    })
  }))
})

const shouldRespondWithGqlError = ({ message, path, response }) => result => {
  expect(result, response).to.have.deep.property('errors[0].message', message)
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal(path)
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
    }
  }
}

module.exports = {
  executeQueryOnDbUsingSchema,
  expectPropertyReceivesValue,
  expectTypeIsFilterableBy,
  expectPropertyIsRequired,
  expectPropertyContentsIsRequired,
  shouldRespondWithGqlError,
  generateFakeContextWithStore
}
