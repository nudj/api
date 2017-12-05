const { graphql } = require('graphql')
const chai = require('chai')
const expect = chai.expect

const transaction = require('../../gql/lodash-adaptor')

async function executeQueryOnDataUsingSchema ({ schema, query, data }) {
  const testContext = { transaction: transaction({ data }) }
  return await graphql(schema, query, undefined, testContext)
}

async function expectPropertyReceivesValue (schema, type, typePlural, property, value) {
  const query = `{
    ${typePlural} {
      ${property}
    }
  }`
  const data = {
    [typePlural]: [
      {
        [property]: value
      }
    ]
  }
  const result = await executeQueryOnDataUsingSchema({ query, data, schema })
  expect(result, `Expected "${type}" schema to include "${property}" property`).to.deep.equal({
    data: {
      [typePlural]: [
        {
          [property]: value
        }
      ]
    }
  })
}

async function expectPropertyIsRequired (schema, type, typePlural, property) {
  const query = `{
    ${typePlural} {
      ${property}
    }
  }`
  const data = {
    [typePlural]: [
      {
        [property]: null
      }
    ]
  }
  const result = await executeQueryOnDataUsingSchema({ query, data, schema })
  expect(result, `Property "${property}" should be required`).to.have.deep.property('errors[0].message', `Cannot return null for non-nullable field ${type}.${property}.`)
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal([
    typePlural,
    0,
    property
  ])
}

module.exports = {
  executeQueryOnDataUsingSchema,
  expectPropertyReceivesValue,
  expectPropertyIsRequired
}
