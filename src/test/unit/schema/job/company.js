/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.company', () => {
  it('should fetch filtered company', async () => {
    const db = {
      jobs: [
        {
          id: 'job1',
          company: 'company2'
        }
      ],
      companies: [
        {
          id: 'company1'
        },
        {
          id: 'company2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          company: {
            id: 'company2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      jobs: [
        {
          id: 'job1',
          company: 'company3'
        }
      ],
      companies: [
        {
          id: 'company1'
        },
        {
          id: 'company2'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          company: null
        }
      }
    })
  })
})
