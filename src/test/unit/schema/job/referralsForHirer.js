/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

describe('Job.referralsForHirer', () => {
  describe('when user is a hirer of type MEMBER', () => {
    describe('when parent is not passed in', () => {
      it('should fetch all referrals owned by them', () => {
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
          referrals: [{
            id: 'referral1',
            job: 'job1',
            person: 'person1'
          }, {
            id: 'referral2',
            job: 'job1',
            person: 'person2',
            parent: 'referral1'
          }, {
            id: 'referral3',
            job: 'job1',
            person: 'person1',
            parent: 'referral2'
          }]
        }

        const operation = `
          query {
            job(id: "job1") {
              id
              referralsForHirer {
                id
              }
            }
          }
        `

        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            job: {
              id: 'job1',
              referralsForHirer: [
                {
                  id: 'referral1'
                },
                {
                  id: 'referral3'
                }
              ]
            }
          }
        })
      })
    })

    describe('when parent is passed in', () => {
      describe('and parent is owned by them', () => {
        it('should fetch all child referrals', () => {
          const db = {
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
            referrals: [{
              id: 'referral1',
              job: 'job1',
              person: 'person1'
            }, {
              id: 'referral2',
              job: 'job1',
              person: 'person2',
              parent: 'referral1'
            }]
          }

          const operation = `
            query {
              job(id: "job1") {
                id
                referralsForHirer (
                  parent: "referral1"
                ) {
                  id
                }
              }
            }
          `

          return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
            data: {
              job: {
                id: 'job1',
                referralsForHirer: [
                  {
                    id: 'referral2'
                  }
                ]
              }
            }
          })
        })

        describe('and parent is not owned by them', () => {
          it('should return empty array', async () => {
            const db = {
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
              referrals: [{
                id: 'referral1',
                job: 'job1',
                person: 'person3'
              }, {
                id: 'referral2',
                job: 'job1',
                person: 'person2',
                parent: 'referral1'
              }]
            }

            const operation = `
              query {
                job(id: "job1") {
                  id
                  referralsForHirer (
                    parent: "referral1"
                  ) {
                    id
                  }
                }
              }
            `

            return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
              data: {
                job: {
                  id: 'job1',
                  referralsForHirer: []
                }
              }
            })
          })
        })

        describe('and parent does not exist', () => {
          it('should return empty array', async () => {
            const db = {
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
              referrals: [{
                id: 'referral1',
                job: 'job1',
                person: 'person3'
              }, {
                id: 'referral2',
                job: 'job1',
                person: 'person2',
                parent: 'referral1'
              }]
            }

            const operation = `
              query {
                job(id: "job1") {
                  id
                  referralsForHirer (
                    parent: "referral3"
                  ) {
                    id
                  }
                }
              }
            `

            return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
              data: {
                job: {
                  id: 'job1',
                  referralsForHirer: []
                }
              }
            })
          })
        })
      })
    })
  })

  describe('when user is a hirer of type ADMIN', () => {
    describe('when parent is not passed in', () => {
      it('should fetch all referrals without parents', () => {
        const db = {
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
          referrals: [{
            id: 'referral1',
            job: 'job1',
            person: 'person1'
          }, {
            id: 'referral2',
            job: 'job1',
            person: 'person2',
            parent: 'referral1'
          }, {
            id: 'referral3',
            job: 'job1',
            person: 'person1',
            parent: 'referral2'
          }]
        }

        const operation = `
          query {
            job(id: "job1") {
              id
              referralsForHirer {
                id
              }
            }
          }
        `

        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            job: {
              id: 'job1',
              referralsForHirer: [
                {
                  id: 'referral1'
                }
              ]
            }
          }
        })
      })
    })

    describe('when parent is passed in', () => {
      describe('and parent does exist', () => {
        it('should fetch all child referrals', () => {
          const db = {
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
            referrals: [{
              id: 'referral1',
              job: 'job1',
              person: 'person1'
            }, {
              id: 'referral2',
              job: 'job1',
              person: 'person2',
              parent: 'referral1'
            }]
          }

          const operation = `
            query {
              job(id: "job1") {
                id
                referralsForHirer (
                  parent: "referral1"
                ) {
                  id
                }
              }
            }
          `

          return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
            data: {
              job: {
                id: 'job1',
                referralsForHirer: [
                  {
                    id: 'referral2'
                  }
                ]
              }
            }
          })
        })

        describe('and parent does not exist', () => {
          it('should return empty array', async () => {
            const db = {
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
              referrals: [{
                id: 'referral1',
                job: 'job1',
                person: 'person3'
              }, {
                id: 'referral2',
                job: 'job1',
                person: 'person2',
                parent: 'referral1'
              }]
            }

            const operation = `
              query {
                job(id: "job1") {
                  id
                  referralsForHirer (
                    parent: "referral3"
                  ) {
                    id
                  }
                }
              }
            `

            return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
              data: {
                job: {
                  id: 'job1',
                  referralsForHirer: []
                }
              }
            })
          })
        })
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
        referrals: [{
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            referralsForHirer {
              id
            }
          }
        }
      `

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })

      shouldRespondWithGqlError({
        path: ['job', 'referralsForHirer']
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
        referrals: [{
          id: 'referral1',
          job: 'job1',
          person: 'person1'
        }]
      }

      const operation = `
        query {
          job(id: "job1") {
            id
            referralsForHirer {
              id
            }
          }
        }
      `

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })

      shouldRespondWithGqlError({
        path: ['job', 'referralsForHirer']
      })(result)
    })
  })
})
