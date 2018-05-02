/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.createOrUpdateAccount', () => {
  let db
  let variables
  const operation = `
    mutation swankyNewAccount ($data: AccountCreateInput!) {
      person (id: "person1") {
        account: createOrUpdateAccount(data: $data) {
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
  beforeEach(() => {
    variables = {
      data: {
        type: 'GOOGLE',
        email: 'bob@johnson.com',
        emailAddresses: ['bob@johnson.com'],
        data: {
          accessToken: '12345',
          refreshToken: 'ABCDE'
        }
      }
    }
  })

  it('should create account for person', async () => {
    db = {
      accounts: [],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(db.accounts[0]).to.deep.equal({
      id: 'account1',
      person: 'person1',
      type: 'GOOGLE',
      email: 'bob@johnson.com',
      emailAddresses: ['bob@johnson.com'],
      data: JSON.stringify({
        accessToken: '12345',
        refreshToken: 'ABCDE'
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
    const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(result).to.deep.equal({
      data: {
        person: {
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

  it('should update an existing account', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          email: 'john@bobson.com',
          emailAddresses: ['john@bobson.com'],
          data: JSON.stringify({
            accessToken: '67890',
            refreshToken: 'FGHIJ'
          })
        }
      ],
      people: [
        {
          id: 'person1',
          firstName: 'Larry'
        }
      ]
    }
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(db.accounts).to.deep.equal([
      {
        id: 'account1',
        person: 'person1',
        type: 'GOOGLE',
        email: 'bob@johnson.com',
        emailAddresses: ['bob@johnson.com'],
        data: JSON.stringify({
          accessToken: '12345',
          refreshToken: 'ABCDE'
        })
      }
    ])
  })

  it('should update data in existing account data', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          email: 'bob@johnson.com',
          emailAddresses: ['bob@johnson.com'],
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
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    expect(db.accounts).to.deep.equal([
      {
        id: 'account1',
        person: 'person1',
        type: 'GOOGLE',
        email: 'bob@johnson.com',
        emailAddresses: ['bob@johnson.com'],
        data: JSON.stringify({
          accessToken: '12345',
          refreshToken: 'ABCDE'
        })
      }
    ])
  })
})
