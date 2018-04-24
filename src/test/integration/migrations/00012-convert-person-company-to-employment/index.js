/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')
const uniq = require('lodash/uniq')
const find = require('lodash/find')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00012-convert-person-company-to-employment')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00012 Convert Person Companies to Employments', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['companies', 'people', 'employments', 'hirers'])
    await populateCollections(db, [
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            name: 'AwesomeCorp'
          },
          {
            _key: 'company2',
            name: 'NotDaGhost & Sons'
          }
        ]
      },
      {
        name: 'people',
        data: [
          {
            _key: 'person1',
            firstName: 'Dave',
            company: 'AwesomeCorp'
          },
          {
            _key: 'person2',
            firstName: 'Steve',
            company: 'Silly Inc.'
          },
          {
            _key: 'person3',
            firstName: 'Gavin',
            company: 'DaGhost & Sons'
          }
        ]
      },
      {
        name: 'hirers',
        data: [
          {
            _key: 'hirer1',
            person: 'person3',
            company: 'company2'
          }
        ]
      },
      {
        name: 'employments',
        data: [
          {
            id: 'employment1',
            company: 'company9',
            person: 'person9',
            current: false
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when direction up', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
    })

    describe('when person is not a hirer', () => {
      it('should create new `employment` entities', async () => {
        const employments = orderBy(await fetchAll(db, 'employments'), 'person')

        expect(employments.length).to.equal(4)
        expect(employments[0]).to.have.property('company').to.equal('company1')
        expect(employments[1]).to.have.property('company').to.be.a('string')
        expect(employments[2]).to.have.property('company').to.equal('company2')
      })

      it('should not create a company for an existing company name', async () => {
        const companies = await fetchAll(db, 'companies')
        const companyNames = companies.map(company => company.name)

        expect(companyNames).to.deep.equal(uniq(companyNames))
      })

      it('should create a company for a new company name', async () => {
        const companies = await fetchAll(db, 'companies')
        const companyNames = companies.map(company => company.name)

        expect(companies.length).to.equal(3)
        expect(companyNames).to.include('Silly Inc.')
      })

      it('should remove `Person.company` field', async () => {
        const people = await fetchAll(db, 'people')

        expect(people.length).to.equal(3)
        expect(people[0].company).to.be.undefined()
        expect(people[1].company).to.be.undefined()
        expect(people[2].company).to.be.undefined()
      })
    })

    describe('when person is a hirer', () => {
      it('should create employment based on `hirer.company`', async () => {
        const companies = await fetchAll(db, 'companies')
        const companyNames = companies.map(company => company.name)

        expect(companies.length).to.equal(3)
        expect(companyNames).to.not.include('DaGhost & Sons')
        expect(companyNames).to.include('NotDaGhost & Sons')
      })
    })
  })

  describe('when direction down', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('should remove all current `employment` entities', async () => {
      const employments = await fetchAll(db, 'employments')

      const currentEmployments = find(employments, { current: true })
      expect(currentEmployments).to.be.undefined()
    })

    it('should restore `Person.company` fields', async () => {
      const people = orderBy(await fetchAll(db, 'people'), 'firstName')

      expect(people[0]).to.have.property('firstName').to.equal('Dave')
      expect(people[0]).to.have.property('company').to.equal('AwesomeCorp')
      expect(people[1]).to.have.property('firstName').to.equal('Gavin')
      expect(people[1]).to.have.property('company').to.equal('NotDaGhost & Sons')
      expect(people[2]).to.have.property('firstName').to.equal('Steve')
      expect(people[2]).to.have.property('company').to.equal('Silly Inc.')
    })

    it('should remove `current` flags from employments', async () => {
      const employments = await fetchAll(db, 'employments')

      expect(employments.length).to.equal(1)
      expect(employments[0].current).to.be.undefined()
    })
  })
})
