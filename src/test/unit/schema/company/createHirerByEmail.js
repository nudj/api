/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

const operation = `
  mutation (
    $email: String!
    $hirer: HirerCreateInput!
  ) {
    companies {
      createHirerByEmail(
        email: $email
        hirer: $hirer
      ) {
        id
      }
    }
  }
`

describe('Company.createHirerByEmail', () => {
  describe('when a `person` with provided email address does not exist', () => {
    let db
    const variables = {
      email: 'rose@badwolf.tld',
      hirer: {
        company: 'company1',
        type: hirerTypes.ADMIN
      }
    }

    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'hey@nudj.co'
          }
        ],
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: []
      }
    })

    it('should create the hirer', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.hirers[0]).to.deep.equal({
        id: 'hirer1',
        company: 'company1',
        person: 'person2',
        onboarded: false,
        type: hirerTypes.ADMIN
      })
    })

    it('should create a person for a new email', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.people[1]).to.deep.equal({
        id: 'person2',
        email: 'rose@badwolf.tld'
      })
    })

    it('should return the new hirer', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(result)
        .to.have.deep.property('data.companies[0].createHirerByEmail')
        .to.deep.equal({
          id: 'hirer1'
        })
    })
  })

  describe('when a `person` with provided email address exists', () => {
    let db
    const variables = {
      email: 'hey@nudj.co',
      hirer: {
        company: 'Bad Wolf Incorporated',
        type: hirerTypes.MEMBER
      }
    }

    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1',
            email: 'hey@nudj.co'
          }
        ],
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: []
      }
    })

    it('should not create a person an existing email', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.people.length).to.equal(1)
      expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'hey@nudj.co'
      })
    })

    it('should create the hirer', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.hirers[0]).to.deep.equal({
        id: 'hirer1',
        company: 'company1',
        person: 'person1',
        onboarded: false,
        type: hirerTypes.MEMBER
      })
    })

    it('should return the new hirer', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(result)
        .to.have.deep.property('data.companies[0].createHirerByEmail')
        .to.deep.equal({
          id: 'hirer1'
        })
    })
  })
})
