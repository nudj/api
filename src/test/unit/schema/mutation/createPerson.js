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

describe('Mutation.createPerson', () => {
  let db

  beforeEach(() => {
    db = {
      people: [],
      companies: [
        {
          id: 'company1',
          name: 'nudj'
        }
      ],
      employments: []
    }
  })

  describe('when the company exists', () => {
    const variables = {
      input: {
        firstName: 'Richie',
        lastName: 'Von Palmerson',
        email: 'palmtherich@test.com',
        company: 'nudj',
        url: 'mysite.com'
      }
    }

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

    it('should create an employment', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.employments[0]).to.deep.equal({
        id: 'employment1',
        company: 'company1',
        current: true,
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should not create a company', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.companies.length).to.equal(1)
      expect(db.companies[0]).to.deep.equal({
        id: 'company1',
        name: 'nudj'
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

  describe('when the company does not exist', () => {
    const variables = {
      input: {
        firstName: 'Richie',
        lastName: 'Von Palmerson',
        email: 'palmtherich@test.com',
        company: 'El Nudjo Magnifico',
        url: 'mysite.com'
      }
    }

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

    it('should create an employment', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.employments[0]).to.deep.equal({
        id: 'employment1',
        company: 'company2',
        current: true,
        person: 'person1',
        source: 'NUDJ'
      })
    })

    it('should create a new company', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.companies.length).to.equal(2)
      expect(db.companies[1]).to.deep.equal({
        id: 'company2',
        name: 'El Nudjo Magnifico',
        slug: 'el-nudjo-magnifico'
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
})
