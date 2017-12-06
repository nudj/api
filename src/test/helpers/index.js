const { graphql } = require('graphql')
const chai = require('chai')
const curry = require('lodash/curry')
const expect = chai.expect

const transaction = require('../../gql/adaptors/lodash')

function executeQueryOnDbUsingSchema ({ schema, variables = {}, query, db }) {
  const testContext = { transaction: transaction({ db }) }
  return graphql(schema, query, undefined, testContext, variables)
}

const expectPropertyReceivesValue = curry(async (schema, type, typePlural, property, value) => {
  const query = `{
    ${typePlural} {
      ${property}
    }
  }`
  const db = {
    [typePlural]: [
      {
        [property]: value
      }
    ]
  }
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
})

const shouldRespondWithGqlError = ({ message, path, response }) => result => {
  expect(result, response).to.have.deep.property('errors[0].message', message)
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal(path)
}

const expectPropertyIsRequired = curry(async (schema, type, typePlural, property) => {
  const query = `{
    ${typePlural} {
      ${property}
    }
  }`
  const db = {
    [typePlural]: [
      {
        [property]: null
      }
    ]
  }
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
})

module.exports = {
  executeQueryOnDbUsingSchema,
  expectPropertyReceivesValue,
  expectPropertyIsRequired,
  shouldRespondWithGqlError
}
