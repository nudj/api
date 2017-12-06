const { graphql } = require('graphql')
const chai = require('chai')
const curry = require('lodash/curry')
const expect = chai.expect

const transaction = require('../../gql/adaptors/lodash')

function executeQueryOnDbUsingSchema ({ schema, query, db }) {
  const testContext = { transaction: transaction({ db }) }
  return graphql(schema, query, undefined, testContext)
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
  const result = await executeQueryOnDbUsingSchema({ query, db, schema })
  expect(result, `Property "${property}" should be required`).to.have.deep.property('errors[0].message', `Cannot return null for non-nullable field ${type}.${property}.`)
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal([
    typePlural,
    0,
    property
  ])
})

module.exports = {
  executeQueryOnDbUsingSchema,
  expectPropertyReceivesValue,
  expectPropertyIsRequired
}
