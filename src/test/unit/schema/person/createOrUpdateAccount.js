/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.createOrUpdateAccount', () => {
  it('should create account for person', async () => {
    const db = {
      accounts: [],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createOrUpdateAccount(type: $type data: $data) {
            id
            person {
              firstName
            }
            type
          }
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        data: {
          accessToken: '12345',
          refreshToken: '6789'
        }
      }
    }
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(() => {
        return expect(db.accounts[0]).to.deep.equal({
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: {
            accessToken: '12345',
            refreshToken: '6789'
          }
        })
      })
  })

  it('should return created value', async () => {
    const db = {
      accounts: [],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createOrUpdateAccount(type: $type data: $data) {
            id
            person {
              id
              firstName
            }
            type
          }
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        data: {
          accessToken: '12345',
          refreshToken: '6789'
        }
      }
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          account: {
            id: 'account1',
            person: {
              id: 'person1',
              firstName: 'Larry'
            },
            type: 'GOOGLE'
          }
        }
      }
    })
  })

  it('should not expose stored data', async () => {
    const db = {
      accounts: [],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createOrUpdateAccount(type: $type data: $data) {
            id
            person {
              id
              firstName
            }
            type
          }
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        data: {
          accessToken: '12345',
          refreshToken: '6789'
        }
      }
    }
    const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    const { account } = result.data.user
    expect(account).to.deep.equal({
      id: 'account1',
      person: {
        id: 'person1',
        firstName: 'Larry'
      },
      type: 'GOOGLE'
    })
    expect(account.data).to.be.undefined()
  })

  it('should update an existing account', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE'
        }
      ],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createOrUpdateAccount(type: $type data: $data) {
            id
            person {
              id
              firstName
            }
            type
          }
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        data: {
          accessToken: '12345',
          refreshToken: 'ABCDE'
        }
      }
    }
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(db.accounts).to.deep.equal([
      {
        id: 'account1',
        person: 'person1',
        type: 'GOOGLE',
        data: {
          accessToken: '12345',
          refreshToken: 'ABCDE'
        }
      }
    ])
  })

  it('should append new data to existing account data', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: {
            refreshToken: 'I_NEED_AN_ACCESS_TOKEN'
          }
        }
      ],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    const operation = `
      mutation swankyNewAccount ($data: Data! $type: AccountType! $userId: ID!) {
        user (id: $userId) {
          account: createOrUpdateAccount(type: $type data: $data) {
            id
            person {
              id
              firstName
            }
            type
          }
        }
      }
    `
    const variables = {
      userId: 'person1',
      type: 'GOOGLE',
      data: {
        data: {
          accessToken: '12345',
          refreshToken: 'REFRESH_TOKEN'
        }
      }
    }
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(db.accounts).to.deep.equal([
      {
        id: 'account1',
        person: 'person1',
        type: 'GOOGLE',
        data: {
          accessToken: '12345',
          refreshToken: 'REFRESH_TOKEN'
        }
      }
    ])
  })
})
