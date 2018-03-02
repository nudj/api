/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $input: PersonCreateInput!
  ) {
    createPerson(input: $input) {
      id
    }
  }
`
const variables = {
  input: {
    firstName: 'Richie',
    lastName: 'Von Palmerson',
    email: 'palmtherich@test.com',
    url: 'mysite.com'
  }
}

describe('Mutation.createPerson', () => {
  let db

  beforeEach(() => {
    db = {
      people: []
    }
  })

  it('should create the person', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.people[0]).to.deep.equal({
      id: 'person1',
      firstName: 'Richie',
      lastName: 'Von Palmerson',
      email: 'palmtherich@test.com',
      url: 'mysite.com'
    })
  })

  it('return the new person', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.createPerson')
      .to.deep.equal({
        id: 'person1'
      })
  })
})
