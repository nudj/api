const { graphql } = require('graphql')
const chai = require('chai')
const curry = require('lodash/curry')
const expect = chai.expect

const transaction = require('../../gql/adaptors/lodash')

function executeQueryOnDbUsingSchema ({ schema, variables = {}, query, mutation, db }) {
  const testContext = { transaction: transaction({ db }) }
  return graphql(schema, query || mutation, undefined, testContext, variables)
}

const expectPropertyReceivesValue = curry(async (schema, type, typePlural, property, value) => {
  const db = {
    [typePlural]: [
      {
        [property]: value
      }
    ]
  }
  await Promise.all(['query', 'mutation'].map(async queryType => {
    const query = `
      ${queryType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    const result = await executeQueryOnDbUsingSchema({ query, db, schema })
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
  await Promise.all(['query', 'mutation'].map(async queryType => {
    let valueForQuery = value
    if (typeof value === 'string') {
      valueForQuery = `"${value}"`
    }
    const query = `
      ${queryType} {
        ${typePlural}ByFilters(filters: {
          ${property}: ${valueForQuery}
        }) {
          ${property}
        }
      }
    `
    const result = await executeQueryOnDbUsingSchema({ query, db, schema })
    expect(result, `Expected "${queryType}.${typePlural}ByFilters" to be filterable by "${property}" property`).to.deep.equal({
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
  await Promise.all(['query', 'mutation'].map(async queryType => {
    const query = `
      ${queryType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    return executeQueryOnDbUsingSchema({ query, db, schema })
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
  await Promise.all(['query', 'mutation'].map(async queryType => {
    const query = `
      ${queryType} {
        ${typePlural} {
          ${property}
        }
      }
    `
    return executeQueryOnDbUsingSchema({ query, db, schema })
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

module.exports = {
  executeQueryOnDbUsingSchema,
  expectPropertyReceivesValue,
  expectTypeIsFilterableBy,
  expectPropertyIsRequired,
  expectPropertyContentsIsRequired,
  shouldRespondWithGqlError
}
