/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation DeleteHirer ($hirerId: ID!, $companyId: ID!) {
    company(id: $companyId) {
      deleteHirer (id: $hirerId) {
        id
      }
    }
  }
`
const variables = { companyId: 'company1', hirerId: 'hirer1' }

describe('Company.deleteHirer', () => {
  let result
  let db
  beforeEach(async () => {
    db = {
      companies: [
        {
          id: 'company1',
          name: 'Flowerpot Men'
        }
      ],
      hirers: [
        {
          id: 'hirer1',
          person: 'person1',
          company: 'company1'
        },
        {
          id: 'hirer2',
          person: 'person2',
          company: 'company1'
        }
      ],
      people: [
        {
          id: 'person1',
          email: 'bill@flowerpotmen.tld',
          firstName: 'Bill'
        },
        {
          id: 'person2',
          email: 'ben@flowerpotmen.tld',
          firstName: 'Ben'
        }
      ]
    }
    result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
  })

  it('deletes the hirer', async () => {
    expect(db.hirers.length).to.equal(1)
    expect(db.hirers[0]).to.deep.equal({
      id: 'hirer2',
      person: 'person2',
      company: 'company1'
    })
  })

  it('does not delete the associated person', () => {
    expect(db.people.length).to.equal(2)
    expect(db.people[0]).to.deep.equal({
      id: 'person1',
      email: 'bill@flowerpotmen.tld',
      firstName: 'Bill'
    })
  })

  it('returns the deleted hirer', () => {
    expect(result.data.company.deleteHirer).to.deep.equal({
      id: 'hirer1'
    })
  })
})
