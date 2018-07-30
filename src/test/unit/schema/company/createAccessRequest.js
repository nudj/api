/* eslint-env mocha */
const chai = require('chai')
const qs = require('qs')
const sinon = require('sinon')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

const mailerStub = sinon.stub()

const operation = `
  mutation createAccessRequest ($person: ID!) {
    company(id: "company1") {
      createAccessRequest(person: $person) {
        id
      }
    }
  }
`

const variables = {
  person: 'person4'
}

describe('Company.createAccessRequest', () => {
  let db
  beforeEach(() => {
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerStub(qs.parse(body))
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
    db = {
      companies: [{
        id: 'company1',
        name: 'Fake Company'
      }],
      hirers: [
        {
          id: 'hirer1',
          type: hirerTypes.ADMIN,
          company: 'company1',
          person: 'person1'
        },
        {
          id: 'hirer2',
          type: hirerTypes.ADMIN,
          company: 'company1',
          person: 'person2'
        },
        {
          id: 'hirer3',
          type: hirerTypes.ADMIN,
          company: 'company2',
          person: 'person3'
        },
        {
          id: 'hirer4',
          type: hirerTypes.MEMBER,
          company: 'company1',
          person: 'person5'
        }
      ],
      people: [
        {
          id: 'person1',
          email: 'hirer@email.tld'
        },
        {
          id: 'person2',
          email: 'otherhirer@email.tld'
        },
        {
          id: 'person3',
          email: 'shouldnotbeemailed@email.tld'
        },
        {
          id: 'person4',
          email: 'therequestee@email.tld'
        },
        {
          id: 'person5',
          email: 'isnotanadminsoshouldnotbeemailed@email.tld'
        }
      ],
      accessRequests: []
    }
  })

  afterEach(() => {
    mailerStub.reset()
    nock.cleanAll()
  })

  it('creates an `accessRequest`', async () => {
    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    expect(db.accessRequests.length).to.equal(1)
    expect(db.accessRequests[0]).to.have.property('company', 'company1')
    expect(db.accessRequests[0]).to.have.property('person', 'person4')
  })

  it('returns the `accessRequest`', async () => {
    const { data } = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    expect(data.company.createAccessRequest).to.have.property('id', 'accessRequest1')
  })

  it('sends an email to all company hirers', async () => {
    await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
    const mailerArgs = mailerStub.args
    expect(mailerStub).to.have.been.calledTwice()
    expect(mailerArgs[0][0]).to.have.property('to', 'hirer@email.tld')
    expect(mailerArgs[1][0]).to.have.property('to', 'otherhirer@email.tld')
  })
})
