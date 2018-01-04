/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Hirer.setOnboarded', () => {
  it('should set onboarded value to true', async () => {
    const db = {
      hirers: [
        {
          id: 'hirer1',
          onboarded: false
        }
      ]
    }
    const operation = `
      mutation {
        hirer (id: "hirer1") {
          onboarded: setOnboarded
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(() => {
        return expect(db.hirers[0].onboarded).to.be.true()
      })
  })

  it('should return onboarded value', async () => {
    const db = {
      hirers: [
        {
          id: 'hirer1',
          onboarded: false
        }
      ]
    }
    const operation = `
      mutation {
        hirer (id: "hirer1") {
          onboarded: setOnboarded
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        hirer: {
          onboarded: true
        }
      }
    })
  })
})
