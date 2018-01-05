/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.incompleteTaskCount', () => {
  const operation = `
    query {
      person (id: "person1") {
        incompleteTaskCount
      }
    }
  `

  it('should return number of incomplete tasks across companyTasks and personTasks for the given person', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      hirers: [
        {
          person: 'person1',
          company: 'company1'
        }
      ],
      companyTasks: [
        {
          id: 'companyTask1',
          company: 'company1',
          completed: false
        }
      ],
      personTasks: [
        {
          id: 'personTask1',
          person: 'person1',
          completed: false
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          incompleteTaskCount: 2
        }
      }
    })
  })

  it('should ignore completed tasks', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      hirers: [
        {
          person: 'person1',
          company: 'company1'
        }
      ],
      companyTasks: [
        {
          id: 'companyTask1',
          company: 'company1',
          completed: true
        }
      ],
      personTasks: [
        {
          id: 'personTask1',
          person: 'person1',
          completed: true
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          incompleteTaskCount: 0
        }
      }
    })
  })
})
