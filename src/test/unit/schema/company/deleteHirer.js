/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation DeleteHirer ($hirerId: ID!, $companyId: ID!) {
    company(id: $companyId) {
      deleteHirer (id: $hirerId) {
        id
      }
    }
  }
`
const variables = { companyId: 'company1', hirerId: 'hirer2' }

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
          company: 'company1',
          type: hirerTypes.ADMIN
        },
        {
          id: 'hirer2',
          person: 'person2',
          company: 'company1',
          type: hirerTypes.ADMIN
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
      id: 'hirer1',
      person: 'person1',
      company: 'company1',
      type: hirerTypes.ADMIN
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
      id: 'hirer2'
    })
  })

  describe('when the user is not an admin', () => {
    beforeEach(() => {
      db = {
        ...db,
        hirers: [
          {
            id: 'hirer1',
            person: 'person1',
            company: 'company1',
            type: hirerTypes.MEMBER
          },
          {
            id: 'hirer2',
            person: 'person2',
            company: 'company1',
            type: hirerTypes.ADMIN
          }
        ]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'User does not have permission to delete teammates',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteHirer'
        ]
      })(result)
    })

    it('does not delete the hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.hirers.length).to.equal(2)
    })
  })

  describe('when the user is not a hirer', () => {
    beforeEach(() => {
      db = {
        ...db,
        hirers: [
          {
            id: 'hirer2',
            person: 'person2',
            company: 'company1',
            type: hirerTypes.ADMIN
          }
        ]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'User does not have permission to delete teammates',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteHirer'
        ]
      })(result)
    })
  })

  describe('when the targeted hirer is from a different company', () => {
    beforeEach(() => {
      db = {
        ...db,
        hirers: [
          {
            id: 'hirer1',
            person: 'person1',
            company: 'company1',
            type: hirerTypes.MEMBER
          },
          {
            id: 'hirer2',
            person: 'person2',
            company: 'company1ButDifferent',
            type: hirerTypes.ADMIN
          }
        ]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'Cannot delete hirers from other companies',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteHirer'
        ]
      })(result)
    })

    it('does not delete the hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.hirers.length).to.equal(2)
    })
  })

  describe('when the targeted hirer is the current user', () => {
    beforeEach(() => {
      db = {
        ...db,
        hirers: [
          {
            id: 'hirer2',
            person: 'person1',
            company: 'company1',
            type: hirerTypes.ADMIN
          }
        ]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'Cannot delete self',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteHirer'
        ]
      })(result)
    })

    it('does not delete the hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.hirers.length).to.equal(1)
    })
  })
})
