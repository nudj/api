/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: dataSources } = require('../../../../gql/schema/enums/data-sources')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')

const db = {
  connections: [
    {
      id: 'connection1',
      from: 'person1',
      firstName: 'Bob',
      lastName: 'Johnson',
      person: 'person2',
      company: 'company1',
      role: 'role1',
      source: dataSources.LINKEDIN
    },
    {
      id: 'connection2',
      from: 'person1',
      firstName: 'Boy',
      lastName: 'Boldman',
      person: 'person3',
      company: 'company2',
      role: 'role2',
      source: dataSources.MANUAL
    },
    {
      id: 'connection3',
      from: 'person1',
      firstName: 'Jim',
      lastName: 'Smith',
      person: 'person4',
      company: 'company2',
      role: 'role2',
      source: dataSources.NUDJ
    }
  ],
  people: [
    {
      id: 'person1',
      email: 'person1@domain1.com'
    },
    {
      id: 'person2',
      email: 'person2@domain2.com'
    },
    {
      id: 'person3',
      email: 'person3@domain3.com'
    },
    {
      id: 'person4',
      email: 'person4@domain4.com'
    }
  ],
  companies: [
    {
      id: 'company1',
      name: 'Company1 Ltd'
    },
    {
      id: 'company2',
      name: 'Company2 Ltd'
    }
  ],
  roles: [
    {
      id: 'role1',
      name: 'Senior Role'
    },
    {
      id: 'role2',
      name: 'Junior Role'
    }
  ],
  surveyQuestions: [
    {
      id: 'surveyQuestion1'
    },
    {
      id: 'surveyQuestion2'
    }
  ],
  surveyAnswers: [
    {
      id: 'surveyAnswer1',
      person: 'person1',
      surveyQuestion: 'surveyQuestion1'
    },
    {
      id: 'surveyAnswer2',
      person: 'person1',
      surveyQuestion: 'surveyQuestion2'
    }
  ],
  surveyAnswerConnections: [
    {
      surveyAnswer: 'surveyAnswer1',
      connection: 'connection1'
    },
    {
      surveyAnswer: 'surveyAnswer1',
      connection: 'connection2'
    },
    {
      surveyAnswer: 'surveyAnswer2',
      connection: 'connection1'
    }
  ],
  surveyQuestionTags: [
    {
      id: 'surveyQuestionTag1',
      surveyQuestion: 'surveyQuestion1',
      tag: 'tag1'
    },
    {
      id: 'surveyQuestionTag2',
      surveyQuestion: 'surveyQuestion2',
      tag: 'tag2'
    }
  ],
  roleTags: [
    {
      id: 'roleTag1',
      role: 'role1',
      tag: 'tag3'
    },
    {
      id: 'roleTag2',
      role: 'role2',
      tag: 'tag4'
    }
  ],
  tags: [
    {
      id: 'tag1',
      name: 'Tag 1',
      type: tagTypes.EXPERTISE
    },
    {
      id: 'tag2',
      name: 'Tag 2',
      type: tagTypes.EXPERTISE
    },
    {
      id: 'tag3',
      name: 'Tag 3',
      type: tagTypes.EXPERTISE
    },
    {
      id: 'tag4',
      name: 'Tag 4',
      type: tagTypes.EXPERTISE
    }
  ]
}

describe('Person.searchConnections', () => {
  describe('when requesting the full connection data', () => {
    const operation = `
      query {
        person (id: "person1") {
          searchConnections(
            query: ""
          ) {
            connections {
              id
              firstName
              lastName
              role {
                name
              }
              company {
                name
              }
              person {
                id
                email
              }
              source
            }
          }
        }
      }
    `
    it('should return the fully composed nested connection', () => {
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
        .to.eventually.deep.equal({
          data: {
            person: {
              searchConnections: {
                connections: [
                  {
                    id: 'connection1',
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    person: {
                      email: 'person2@domain2.com',
                      id: 'person2'
                    },
                    company: {
                      name: 'Company1 Ltd'
                    },
                    role: {
                      name: 'Senior Role'
                    },
                    source: 'LINKEDIN'
                  },
                  {
                    id: 'connection2',
                    firstName: 'Boy',
                    lastName: 'Boldman',
                    person: {
                      email: 'person3@domain3.com',
                      id: 'person3'
                    },
                    company: {
                      name: 'Company2 Ltd'
                    },
                    role: {
                      name: 'Junior Role'
                    },
                    source: 'MANUAL'
                  },
                  {
                    id: 'connection3',
                    firstName: 'Jim',
                    lastName: 'Smith',
                    person: {
                      email: 'person4@domain4.com',
                      id: 'person4'
                    },
                    company: {
                      name: 'Company2 Ltd'
                    },
                    role: {
                      name: 'Junior Role'
                    },
                    source: 'NUDJ'
                  }
                ]
              }
            }
          }
        })
    })
  })

  describe('when searching', () => {
    describe('with an empty search', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: ""
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return all connections relating to the person', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.have.lengthOf(3)
      })
    })

    describe('with a non matching search', () => {
      const operation = `
      query {
        person (id: "person1") {
          searchConnections(
            query: "fbrehugbruebea"
          ) {
            connections {
              id
            }
          }
        }
      }
      `
      it('should return an empty array', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
        .to.eventually.have.deep.property('data.person.searchConnections.connections')
        .to.have.lengthOf(0)
      })
    })

    describe('when search term matches firstName', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Bob"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return the matching connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([ { id: 'connection1' } ])
      })
    })

    describe('when search term matches lastName', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Johnson"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return the matching connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([ { id: 'connection1' } ])
      })
    })

    describe('when search term matches email', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "domain2"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return the matching connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([ { id: 'connection1' } ])
      })
    })

    describe('when search term matches company name', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Company1"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return the matching connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([ { id: 'connection1' } ])
      })
    })

    describe('when search term matches role name', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Senior"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should return the matching connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([ { id: 'connection1' } ])
      })
    })

    describe('when sorting the results', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Bo"
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should sort them by search score', () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([
            { id: 'connection2' },
            { id: 'connection1' }
          ])
      })
    })
  })

  describe('when filtering', () => {
    describe('by favourites', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "",
              filters: {
                favourites: true
              }
            ) {
              connections {
                id
              }
            }
          }
        }
      `
      it('should only return connections that user has provided as an answer to a surveyQuestion', () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.have.lengthOf(2)
          .to.deep.equal([
            { id: 'connection1' },
            { id: 'connection2' }
          ])
      })
    })

    describe('by tag', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "",
              filters: {
                expertiseTags: ["tag2"]
              }
            ) {
              connections {
                id
              }
              tags {
                id
              }
            }
          }
        }
      `
      it('should only return connections that user has provided as an answer to a surveyQuestion', () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.have.lengthOf(1)
          .to.deep.equal([ { id: 'connection1' } ])
      })
      it('should return tags list derived from connections prior to tag filtering', () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.tags')
          .to.have.lengthOf(4)
          .to.deep.equal([
            { id: 'tag1' },
            { id: 'tag2' },
            { id: 'tag3' },
            { id: 'tag4' }
          ])
      })
    })
  })

  describe('when requesting tags', () => {
    describe('with one result', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Bob"
            ) {
              connections {
                id
              }
              tags {
                id
                name
                type
              }
            }
          }
        }
      `
      it('should return an array of the tags associated with the connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.tags')
          .to.deep.equal([
            {
              id: 'tag1',
              name: 'Tag 1',
              type: tagTypes.EXPERTISE
            },
            {
              id: 'tag2',
              name: 'Tag 2',
              type: tagTypes.EXPERTISE
            },
            {
              id: 'tag3',
              name: 'Tag 3',
              type: tagTypes.EXPERTISE
            }
          ])
      })
    })

    describe('with multiple results', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Bo"
            ) {
              tags {
                id
                name
                type
              }
            }
          }
        }
      `
      it('should return an array of all the unique tags associated with the results', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.tags')
          .to.deep.equal([
            {
              id: 'tag1',
              name: 'Tag 1',
              type: tagTypes.EXPERTISE
            },
            {
              id: 'tag2',
              name: 'Tag 2',
              type: tagTypes.EXPERTISE
            },
            {
              id: 'tag3',
              name: 'Tag 3',
              type: tagTypes.EXPERTISE
            },
            {
              id: 'tag4',
              name: 'Tag 4',
              type: tagTypes.EXPERTISE
            }
          ])
      })
    })
  })

  describe('when requesting the results meta', () => {
    describe('with multiple results', () => {
      const operation = `
        query {
          person (id: "person1") {
            searchConnections(
              query: "Bo"
            ) {
              connections {
                _result {
                  score
                  matches
                }
              }
            }
          }
        }
      `
      it('should return the score and matches appended to each connection', async () => {
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema }))
          .to.eventually.have.deep.property('data.person.searchConnections.connections')
          .to.deep.equal([
            {
              _result: {
                score: 3.2,
                matches: [ 'Boy', 'Boldman' ]
              }
            },
            {
              _result: {
                score: 1.7,
                matches: [ 'Bob' ]
              }
            }
          ])
      })
    })
  })
})
