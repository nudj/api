/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Company.referral', () => {
  describe('when referral with id does not exist', () => {
    it('should return null', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        referrals: [
          {
            id: 'referral2'
          }
        ]
      }
      const operation = `
        query {
          company (id: "company1") {
            referral (id: "referral1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            referral: null
          }
        }
      })
    })
  })

  describe('when referral exists and is related to one of the company\'s job', () => {
    it('should return the referral', async () => {
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
        referrals: [
          {
            id: 'referral1',
            job: 'job1'
          }
        ]
      }
      const operation = `
        query {
          company (id: "company1") {
            referral (id: "referral1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            referral: {
              id: 'referral1'
            }
          }
        }
      })
    })
  })

  describe('when referral exists and is not related to one of the company\'s job', () => {
    it('should return null', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        referrals: [
          {
            id: 'referral1',
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
            referral (id: "referral1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          company: {
            referral: null
          }
        }
      })
    })
  })
})
