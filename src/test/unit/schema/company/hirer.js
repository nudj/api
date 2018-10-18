/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    company ( id: "company1" ) {
      hirer ( id: "hirer1" ) {
        id
      }
    }
  }
`
const baseData = {
  people: [
    {
      id: 'person1'
    }
  ],
  companies: [
    {
      id: 'company1'
    }
  ]
}

describe('Company.hirer', () => {
  it('should return the hirer', async () => {
    const db = merge(baseData, {
      hirers: [
        {
          id: 'hirer1',
          company: 'company1'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          hirer: {
            id: 'hirer1'
          }
        }
      }
    })
  })

  describe('when hirer id does not exist', () => {
    let db
    let result

    beforeEach(async () => {
      db = merge(baseData, {
        hirers: [
          {
            id: 'hirer2',
            company: 'company1'
          }
        ]
      })
    })
    afterEach(() => {
      result = undefined
    })

    it('should not error', async () => {
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.not.have.property('errors')
    })

    it('should return null', async () => {
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.have.property('data').to.deep.equal({
        company: {
          hirer: null
        }
      })
    })
  })

  describe('when hirer is not from the company in context', () => {
    it('should return null', async () => {
      const db = merge(baseData, {
        hirers: [
          {
            id: 'hirer1',
            company: 'company2'
          }
        ]
      })
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.have.property('data').to.deep.equal({
        company: {
          hirer: null
        }
      })
    })
  })
})
