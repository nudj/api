/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation viewJobPage ($type: EventType!, $browserId: String) {
    job(id: "job1") {
      recordEvent(type: $type, browserId: $browserId) {
        id
        browserId
      }
    }
  }
`

describe('Job.recordEvent', () => {
  describe('if event does not exist', () => {
    it('should create a new event', () => {
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: []
      }
      const variables = {
        type: 'viewed',
        browserId: '12345'
      }

      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          job: {
            recordEvent: {
              id: 'event1',
              browserId: '12345'
            }
          }
        }
      })
    })
  })

  describe('if event filtered by job and browserId exists', () => {
    it('should not create new entry', () => {
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: [
          {
            id: 'preExistingEvent',
            entityId: 'job1',
            browserId: '12345'
          }
        ]
      }
      const variables = {
        type: 'viewed',
        browserId: '12345'
      }

      const result = executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      expect(result).to.eventually.deep.equal({
        data: {
          job: {
            recordEvent: {
              id: 'preExistingEvent',
              browserId: '12345'
            }
          }
        }
      })
      expect(db.events).to.deep.equal([
        {
          id: 'preExistingEvent',
          entityId: 'job1',
          browserId: '12345'
        }
      ])
    })
  })

  describe('if browserId exists for different job', () => {
    it('creates new event', () => {
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: [
          {
            id: 'preExistingEvent',
            entityId: 'job42',
            browserId: '12345'
          }
        ]
      }
      const variables = {
        type: 'viewed',
        browserId: '12345'
      }

      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          job: {
            recordEvent: {
              id: 'event2',
              browserId: '12345'
            }
          }
        }
      })
    })
  })

  describe('if jobId exists for different browserId', () => {
    it('creates new event', () => {
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: [
          {
            id: 'preExistingEvent',
            entityId: 'job1',
            browserId: '78910'
          }
        ]
      }
      const variables = {
        type: 'viewed',
        browserId: '12345'
      }

      return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(result => {
        expect(result).to.deep.equal({
          data: {
            job: {
              recordEvent: {
                id: 'event2',
                browserId: '12345'
              }
            }
          }
        })
        expect(db.events).to.deep.equal([
          {
            id: 'preExistingEvent',
            entityId: 'job1',
            browserId: '78910'
          },
          {
            id: 'event2',
            entityId: 'job1',
            entityType: 'jobs',
            eventType: 'viewed',
            browserId: '12345'
          }
        ])
      })
    })
  })

  describe('if browserId is not supplied', () => {
    it('creates new browserId and event', () => {
      const db = {
        jobs: [
          {
            id: 'job1'
          }
        ],
        events: []
      }
      const variables = {
        type: 'viewed'
      }

      return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(result => {
        const event = result.data.job.recordEvent
        expect(event.browserId).to.exist()
        expect(typeof event.browserId).to.equal('string')
      })
    })
  })
})
