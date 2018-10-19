/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Company.application', () => {
  describe('when application with id does not exist', () => {
    it('should return null', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        applications: [
          {
            id: 'application2'
          }
        ]
      }
      const operation = `
        query {
          company (id: "company1") {
            application (id: "application1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            application: null
          }
        }
      })
    })
  })

  describe('when application exists and is related to one of the company\'s job', () => {
    it('should return the application', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        jobs: [
          {
            id: 'job1',
            company: 'company1'
          }
        ],
        applications: [
          {
            id: 'application1',
            job: 'job1'
          }
        ]
      }
      const operation = `
        query {
          company (id: "company1") {
            application (id: "application1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            application: {
              id: 'application1'
            }
          }
        }
      })
    })
  })

  describe('when application exists and is not related to one of the company\'s job', () => {
    it('should return null', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        applications: [
          {
            id: 'application1',
            job: 'job1'
          }
        ],
        jobs: [
          {
            id: 'job1',
            company: 'company2'
          }
        ]
      }
      const operation = `
        query {
          company (id: "company1") {
            application (id: "application1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            application: null
          }
        }
      })
    })
  })
})
