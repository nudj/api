/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.createAccount', () => {
  it('should create account for person', async () => {
    const db = {
      accounts: [],
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createAccount(type: $type data: $data)
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        accessToken: '12345',
        refreshToken: '6789'
      }
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(() => {
        return expect(db.accounts[0]).to.deep.equal({
          person: 'person1',
          type: 'GOOGLE',
          accessToken: '12345',
          refreshToken: '6789',
          id: 'account1'
        })
      })
  })

  it('should return created value', async () => {
    const db = {
      accounts: [],
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createAccount(type: $type data: $data)
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        accessToken: '12345',
        refreshToken: '6789'
      }
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          account: {
            person: 'person1',
            type: 'GOOGLE',
            accessToken: '12345',
            refreshToken: '6789',
            id: 'account1'
          }
        }
      }
    })
  })
})
