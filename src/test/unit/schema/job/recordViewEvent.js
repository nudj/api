/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.recordViewEvent', () => {
  describe('if event does not exist', () => {
    it('should create a new event', () => {
      const operation = `
        mutation viewJobPage ($browserId: String) {
          job(id: "job1") {
            recordViewEvent(browserId: $browserId) {
              id
              browserId
            }
          }
        }
      `
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ]
      }
      const nosql = {
        jobViewEvents: []
      }
      const variables = {
        browserId: '12345'
      }

      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, nosql, schema })).to.eventually.deep.equal({
        data: {
          job: {
            recordViewEvent: {
              id: 'jobViewEvent1',
              browserId: '12345'
            }
          }
        }
      })
    })
  })

  describe('if browserId is not supplied', () => {
    it('creates new browserId and event', () => {
      const operation = `
        mutation viewJobPage ($browserId: String) {
          job(id: "job1") {
            recordViewEvent(browserId: $browserId) {
              id
              browserId
            }
          }
        }
      `
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: []
      }
      const nosql = {
        jobViewEvents: []
      }
      const variables = {}

      return executeQueryOnDbUsingSchema({ operation, variables, db, nosql, schema })
      .then(result => {
        const event = result.data.job.recordViewEvent
        expect(event.browserId).to.exist()
        expect(typeof event.browserId).to.equal('string')
      })
    })
  })
})
