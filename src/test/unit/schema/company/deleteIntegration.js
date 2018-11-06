/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const clone = require('lodash/cloneDeep')
const schema = require('../../../../gql/schema')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation DeleteIntegration ($integrationId: ID!, $companyId: ID!) {
    company(id: $companyId) {
      deleteIntegration (id: $integrationId) {
        id
      }
    }
  }
`
const variables = {
  companyId: 'company1',
  integrationId: 'companyIntegration1'
}
const baseDb = {
  companies: [
    {
      id: 'company1',
      name: 'Flowerpot Men'
    }
  ],
  companyIntegrations: [
    {
      id: 'companyIntegration1',
      company: 'company1'
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
      type: hirerTypes.MEMBER
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

describe('Company.deleteIntegration', () => {
  let result
  let db
  beforeEach(async () => {
    db = clone(baseDb)
    result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
  })

  it('deletes the integration', async () => {
    expect(db.companyIntegrations.length).to.equal(0)
  })

  it('returns the deleted integration', () => {
    expect(result.data.company.deleteIntegration).to.deep.equal({
      id: 'companyIntegration1'
    })
  })

  describe('when the user is not an admin', () => {
    beforeEach(() => {
      db = {
        ...clone(baseDb),
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
        message: 'User does not have permission to delete integrations',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteIntegration'
        ]
      })(result)
    })

    it('does not delete the integration', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.companyIntegrations.length).to.equal(1)
    })
  })

  describe('when the user is not a hirer', () => {
    beforeEach(() => {
      db = {
        ...clone(baseDb),
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
        message: 'User does not have permission to delete integrations',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteIntegration'
        ]
      })(result)
    })

    it('does not delete the integration', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.companyIntegrations.length).to.equal(1)
    })
  })

  describe('when the targeted integration is related to a different company', () => {
    beforeEach(() => {
      db = {
        ...clone(baseDb),
        hirers: [
          {
            id: 'hirer1',
            person: 'person1',
            company: 'company1',
            type: hirerTypes.MEMBER
          }
        ],
        companyIntegrations: [
          {
            id: 'companyIntegration1',
            company: 'company1ButDifferent'
          }
        ]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      shouldRespondWithGqlError({
        message: 'Cannot delete integrations from other companies',
        locations: [{ line: 4, column: 7 }],
        path: [
          'company',
          'deleteIntegration'
        ]
      })(result)
    })

    it('does not delete the hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      expect(db.hirers.length).to.equal(1)
    })
  })
})
