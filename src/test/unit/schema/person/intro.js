/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

describe('Person.intro', () => {
  describe('when intro with id does not exist', () => {
    it('should return null', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          }
        ],
        intros: [
          {
            id: 'intro2'
          }
        ]
      }
      const operation = `
        query {
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: null
          }
        }
      })
    })
  })

  describe('when intro exists and person owns the intro', () => {
    it('should return the intro', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          }
        ],
        intros: [
          {
            id: 'intro1',
            person: 'person1'
          }
        ]
      }
      const operation = `
        query {
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: {
              id: 'intro1'
            }
          }
        }
      })
    })
  })

  describe('when intro exists and person does not own the intro but is an ADMIN hirer for the company that owns the intro', () => {
    it('should return the intro', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        intros: [
          {
            id: 'intro1',
            person: 'person2',
            job: 'job1'
          }
        ],
        hirers: [
          {
            id: 'hirer1',
            company: 'company1',
            person: 'person1',
            type: hirerTypes.ADMIN
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
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: {
              id: 'intro1'
            }
          }
        }
      })
    })
  })

  describe('when intro exists and person does not own the intro and is not an ADMIN hirer for the company that owns the intro', () => {
    it('should return null', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        intros: [
          {
            id: 'intro1',
            person: 'person2',
            job: 'job1'
          }
        ],
        hirers: [
          {
            id: 'hirer1',
            company: 'company1',
            person: 'person1',
            type: hirerTypes.MEMBER
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
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: null
          }
        }
      })
    })
  })

  describe('when intro exists and person does not own the intro and is an ADMIN hirer but not for the company that owns the intro', () => {
    it('should return null', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        intros: [
          {
            id: 'intro1',
            person: 'person2',
            job: 'job1'
          }
        ],
        hirers: [
          {
            id: 'hirer1',
            company: 'company2',
            person: 'person1',
            type: hirerTypes.ADMIN
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
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: null
          }
        }
      })
    })
  })

  describe('when intro exists and person does not own the intro and is not a hirer', () => {
    it('should return null', async () => {
      const db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ],
        intros: [
          {
            id: 'intro1',
            person: 'person2',
            job: 'job1'
          }
        ],
        hirers: [],
        jobs: [
          {
            id: 'job1',
            company: 'company1'
          }
        ]
      }
      const operation = `
        query {
          person (id: "person1") {
            intro (id: "intro1") {
              id
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          person: {
            intro: null
          }
        }
      })
    })
  })
})
