/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.hirers', () => {
  describe('when the company is specified', () => {
    const operation = `
      query {
        hirersAsPeople {
          id
        }
      }
    `
    it('should fetch all people who are hirers', async () => {
      const db = {
        hirers: [
          {
            id: 'hirer1',
            person: 'person1'
          },
          {
            id: 'hirer2',
            person: 'person2'
          }
        ],
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          },
          {
            id: 'person3'
          }
        ]
      }
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          hirersAsPeople: [
            {
              id: 'person1'
            },
            {
              id: 'person2'
            }
          ]
        }
      })
    })

    it('should return empty array if no matches', async () => {
      const db = {
        hirers: [
          {
            id: 'hirer1',
            person: 'personNoWay'
          },
          {
            id: 'hirer2',
            person: 'personNope'
          }
        ],
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          },
          {
            id: 'person3'
          }
        ]
      }
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          hirersAsPeople: []
        }
      })
    })
  })

  describe('when the company is not specifed', () => {
    const operation = `
      query {
        hirersAsPeople(company: "company1") {
          id
        }
      }
    `
    it('should fetch all people who are hirers', async () => {
      const db = {
        hirers: [
          {
            id: 'hirer1',
            company: 'company1',
            person: 'person1'
          },
          {
            id: 'hirer2',
            company: 'company45',
            person: 'person2'
          }
        ],
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          },
          {
            id: 'person3'
          }
        ]
      }
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          hirersAsPeople: [
            {
              id: 'person1'
            }
          ]
        }
      })
    })

    it('should return empty array if no matches', async () => {
      const db = {
        hirers: [
          {
            id: 'hirer1',
            company: 'companyNope',
            person: 'personNoWay'
          },
          {
            id: 'hirer2',
            company: 'companyNoThanks',
            person: 'personNope'
          }
        ],
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          },
          {
            id: 'person3'
          }
        ]
      }
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          hirersAsPeople: []
        }
      })
    })
  })
})
