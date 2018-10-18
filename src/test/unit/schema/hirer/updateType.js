/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

describe('Hirer.updateType', () => {
  it('should update type value', async () => {
    const db = {
      hirers: [
        {
          id: 'hirer1',
          type: hirerTypes.MEMBER
        }
      ]
    }
    const operation = `
      mutation {
        hirer (id: "hirer1") {
          updateType (type: ${hirerTypes.ADMIN})
        }
      }
    `
    await executeQueryOnDbUsingSchema({ operation, db, schema })
    return expect(db.hirers[0].type).to.equal(hirerTypes.ADMIN)
  })

  it('should return updated type value', async () => {
    const db = {
      hirers: [
        {
          id: 'hirer1',
          type: hirerTypes.MEMBER
        }
      ]
    }
    const operation = `
      mutation {
        hirer (id: "hirer1") {
          updateType (type: ${hirerTypes.ADMIN})
        }
      }
    `
    const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    expect(result).to.deep.equal({
      data: {
        hirer: {
          updateType: hirerTypes.ADMIN
        }
      }
    })
  })
})
