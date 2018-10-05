/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

describe('Job.introsForHirer', () => {
  describe('when user is a hirer of type MEMBER', () => {
    it('should fetch all intros relating to the job and hirer', () => {
      const db = {
        people: [{
          id: 'person1'
        }, {
          id: 'person2'
        }],
        hirers: [{
          id: 'hirer1',
          person: 'person1',
          company: 'company1',
          type: hirerTypes.MEMBER
        }],
        jobs: [{
          id: 'job1',
          company: 'company1'
        }],
        intros: [{
          id: 'intro1',
          job: 'job1',
          person: 'person1'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            introsForHirer {
              id
            }
          }
        }
      `

      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          job: {
            id: 'job1',
            introsForHirer: [
              {
                id: 'intro1'
              }
            ]
          }
        }
      })
    })
  })

  describe('when user is a hirer of type ADMIN', () => {
    it('should fetch all intros relating to the job', () => {
      const db = {
        people: [{
          id: 'person1'
        }, {
          id: 'person2'
        }],
        hirers: [{
          id: 'hirer1',
          person: 'person1',
          company: 'company1',
          type: hirerTypes.ADMIN
        }],
        jobs: [{
          id: 'job1',
          company: 'company1'
        }],
        intros: [{
          id: 'intro1',
          job: 'job1',
          person: 'person1'
        }, {
          id: 'intro2',
          job: 'job1',
          person: 'person2'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            introsForHirer {
              id
            }
          }
        }
      `

      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          job: {
            id: 'job1',
            introsForHirer: [
              {
                id: 'intro1'
              },
              {
                id: 'intro2'
              }
            ]
          }
        }
      })
    })
  })

  describe('when user is not a hirer', () => {
    it('should error', async () => {
      const db = {
        people: [{
          id: 'person1'
        }],
        hirers: [],
        jobs: [{
          id: 'job1',
          company: 'company1'
        }],
        intros: [{
          id: 'intro1',
          job: 'job1',
          person: 'person1'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            introsForHirer {
              id
            }
          }
        }
      `

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })

      shouldRespondWithGqlError({
        path: ['job', 'introsForHirer']
      })(result)
    })
  })

  describe('when user is not a hirer for the right company', () => {
    it('should error', async () => {
      const db = {
        people: [{
          id: 'person1'
        }],
        hirers: [{
          id: 'hirer1',
          person: 'person1',
          company: 'company2',
          type: hirerTypes.ADMIN
        }],
        jobs: [{
          id: 'job1',
          company: 'company1'
        }],
        intros: [{
          id: 'intro1',
          job: 'job1',
          person: 'person1'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            introsForHirer {
              id
            }
          }
        }
      `

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })

      shouldRespondWithGqlError({
        path: ['job', 'introsForHirer']
      })(result)
    })
  })
})
