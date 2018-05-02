/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema
} = require('../../helpers')

describe('Person.verifyGoogleAuthentication', () => {
  it('should return true if a refreshToken exists', async () => {
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
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'BIG_FAT_ACCESS_TOKEN',
            refreshToken: 'BIG_FAT_REFRESH_TOKEN'
          })
        }
      ]
    }
    const operation = `
      query {
        user {
          googleAuth: verifyGoogleAuthentication
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          googleAuth: true
        }
      }
    })
  })

  it('should return false if a refreshToken does not exist', async () => {
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
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'BIG_FAT_ACCESS_TOKEN'
          })
        }
      ]
    }
    const operation = `
      query {
        user {
          googleAuth: verifyGoogleAuthentication
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          googleAuth: false
        }
      }
    })
  })

  it('should return false if an account does not exist', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      accounts: [
        {
          id: 'account1',
          person: 'not_the_right_person',
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'BIG_FAT_ACCESS_TOKEN',
            refreshToken: 'BIG_FAT_REFRESH_TOKEN'
          })
        }
      ]
    }
    const operation = `
      query {
        user {
          googleAuth: verifyGoogleAuthentication
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          googleAuth: false
        }
      }
    })
  })

  it('should return false if a GOOGLE account does not exist', async () => {
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
          type: 'OUTLOOK',
          data: JSON.stringify({
            accessToken: 'BIG_FAT_ACCESS_TOKEN',
            refreshToken: 'BIG_FAT_REFRESH_TOKEN'
          })
        }
      ]
    }
    const operation = `
      query {
        user {
          googleAuth: verifyGoogleAuthentication
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          googleAuth: false
        }
      }
    })
  })
})
