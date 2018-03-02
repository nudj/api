/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.hirer', () => {
  it('should fetch filtered hirer', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      hirers: [
        {
          id: 'hirer1'
        },
        {
          id: 'hirer2',
          person: 'person1'
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          hirer {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          hirer: {
            id: 'hirer2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1',
          hirer: 'hirer3'
        }
      ],
      hirers: [
        {
          id: 'hirer1'
        },
        {
          id: 'hirer2'
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          hirer {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          hirer: null
        }
      }
    })
  })
})
