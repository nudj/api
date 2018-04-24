/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: emailPreferences } = require('../../../../gql/schema/enums/email-preference-types')

const operation = `
  query testQuery (
    $accountType: AccountType!
  ) {
    user {
      account: accountByFilters(filters: {
        type: $accountType
      }) {
        id
      }
    }
  }
`
const variables = {
  accountType: emailPreferences.GOOGLE
}

describe('Person.accountByFilters', () => {
  it('should fetch filtered account', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: emailPreferences.GOOGLE
        }
      ]
    }

    return executeQueryOnDbUsingSchema({
      operation,
      db,
      schema,
      variables
    }).then(result => {
      return expect(result).to.deep.equal({
        data: {
          user: {
            account: {
              id: 'account1'
            }
          }
        }
      })
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: emailPreferences.OTHER
        }
      ]
    }

    return executeQueryOnDbUsingSchema({
      operation,
      db,
      schema,
      variables
    }).then(result => {
      return expect(result).to.deep.equal({
        data: {
          user: {
            account: null
          }
        }
      })
    })
  })
})
