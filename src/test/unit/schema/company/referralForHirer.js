/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

describe('Company.referralForHirer', () => {
  describe('when user is of type ADMIN', () => {
    describe('when referral with id does not exist', () => {
      it('should return null', async () => {
        const db = {
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.ADMIN
            }
          ],
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
              referralForHirer (id: "referral1") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: null
            }
          }
        })
      })
    })

    describe('when referral exists and is related to one of the company\'s job', () => {
      it('should return the referral', async () => {
        const db = {
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.ADMIN
            }
          ],
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
              referralForHirer (id: "referral1") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: {
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
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.ADMIN
            }
          ],
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
              referralForHirer (id: "referral1") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: null
            }
          }
        })
      })
    })
  })

  describe('when user is of type MEMBER', () => {
    describe('when referral is owned by the user', () => {
      it('should return referral', async () => {
        const db = {
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.MEMBER
            }
          ],
          companies: [
            {
              id: 'company1'
            }
          ],
          referrals: [
            {
              id: 'referral1',
              job: 'job1',
              person: 'person1'
            }
          ],
          jobs: [
            {
              id: 'job1',
              company: 'company1'
            }
          ]
        }
        const operation = `
          query {
            company (id: "company1") {
              referralForHirer (id: "referral1") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: {
                id: 'referral1'
              }
            }
          }
        })
      })
    })

    describe('when referral is an immediate child of a referral owned by the user', () => {
      it('should return referral', async () => {
        const db = {
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.MEMBER
            }
          ],
          companies: [
            {
              id: 'company1'
            }
          ],
          referrals: [
            {
              id: 'referral1',
              job: 'job1',
              person: 'person1'
            },
            {
              id: 'referral2',
              job: 'job1',
              person: 'person2',
              parent: 'referral1'
            }
          ],
          jobs: [
            {
              id: 'job1',
              company: 'company1'
            }
          ]
        }
        const operation = `
          query {
            company (id: "company1") {
              referralForHirer (id: "referral2") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: {
                id: 'referral2'
              }
            }
          }
        })
      })
    })

    describe('when referral is not owned by or a immediate child of a referral owned by the user', () => {
      it('should return null', async () => {
        const db = {
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1',
              type: hirerTypes.MEMBER
            }
          ],
          companies: [
            {
              id: 'company1'
            }
          ],
          referrals: [
            {
              id: 'referral1',
              job: 'job1',
              person: 'person2'
            },
            {
              id: 'referral2',
              job: 'job1',
              person: 'person3',
              parent: 'referral1'
            }
          ],
          jobs: [
            {
              id: 'job1',
              company: 'company1'
            }
          ]
        }
        const operation = `
          query {
            company (id: "company1") {
              referralForHirer (id: "referral2") {
                id
              }
            }
          }
        `
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              referralForHirer: null
            }
          }
        })
      })
    })
  })
})
