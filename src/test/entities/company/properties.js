/* eslint-env mocha */

const { makeExecutableSchema } = require('graphql-tools')
const { graphql } = require('graphql')
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const customScalars = require('../../../gql/scalars')
const { typeDefs } = require('../../../gql/entities/company')

const TYPE = 'Company'
const DUMMY_ID = '123'
const DUMMY_STRING = 'abc'
const DUMMY_DATETIME = '2000-01-17T02:51:58.000+00:00'

// function getContextForData (data) {
//   const store = () => ({
//     readOne: ({
//       type,
//       id
//     }) => Promise.resolve(find(get(data, type), { id })),
//     readAll: ({
//       type
//     }) => Promise.resolve(get(data, type))
//   })
//   const transaction = (action, params) => {
//     return action(store(), params)
//   }
//   return { transaction }
// }

function executeQueryOnSchemaFor (type, property, value = null) {
  const data = { [property]: value }
  const schema = makeExecutableSchema({
    typeDefs: [
      `
        type Query {
          ${type}: ${type}
        }
      `,
      ...customScalars.typeDefs,
      ...typeDefs
    ],
    resolvers: merge(
      {
        Query: {
          [type]: () => data
        }
      },
      customScalars.resolvers
    )
  })
  const query = `{
    ${type} {
      ${property}
    }
  }`
  return graphql(schema, query)
}

async function expectPropertyReceivesValue (type, property, value) {
  const result = await executeQueryOnSchemaFor(type, property, value)
  expect(result, `Expected "${type}" schema to include "${property}" property`).to.deep.equal({
    data: {
      [type]: {
        [property]: value
      }
    }
  })
}

async function expectPropertyIsRequired (type, property) {
  const result = await executeQueryOnSchemaFor(type, property)
  expect(result, `Property "${property}" should be required`).to.have.deep.property('errors[0].message', `Cannot return null for non-nullable field Company.${property}.`)
  expect(result).to.have.deep.property('errors[0].path').to.deep.equal([
    TYPE,
    property
  ])
}

describe.only('Company properties', () => {
  it('should be queriable by the following properties', async () => {
    await expectPropertyReceivesValue(TYPE, 'id', DUMMY_ID)
    await expectPropertyReceivesValue(TYPE, 'created', DUMMY_DATETIME)
    await expectPropertyReceivesValue(TYPE, 'modified', DUMMY_DATETIME)
    await expectPropertyReceivesValue(TYPE, 'name', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'slug', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'description', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'mission', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'facebook', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'industry', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'linkedin', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'location', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'logo', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'size', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'twitter', DUMMY_STRING)
    await expectPropertyReceivesValue(TYPE, 'url', DUMMY_STRING)
  })
  it('should have the following required properties', async () => {
    await expectPropertyIsRequired(TYPE, 'id')
    await expectPropertyIsRequired(TYPE, 'created')
    await expectPropertyIsRequired(TYPE, 'modified')
    await expectPropertyIsRequired(TYPE, 'name')
    await expectPropertyIsRequired(TYPE, 'slug')
  })
})
