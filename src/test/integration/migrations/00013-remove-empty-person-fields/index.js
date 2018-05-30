/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const find = require('lodash/find')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00013-remove-unused-person-fields')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00013 Remove Empty `Person` fields', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['people'])
    await populateCollections(db, [
      {
        name: 'people',
        data: [
          {
            _key: 'person1',
            firstName: 'EmptyTitle',
            title: ''
          },
          {
            _key: 'person2',
            firstName: 'HasATitle',
            title: 'King of All Londinium'
          },
          {
            _key: 'person3',
            firstName: 'EmptyCompany',
            company: ''
          },
          {
            _key: 'person4',
            firstName: 'HasACompany',
            company: 'Serenity'
          },
          {
            _key: 'person5',
            firstName: 'EmptyType',
            type: ''
          },
          {
            _key: 'person6',
            firstName: 'HasAType',
            type: 'Firefly'
          },
          {
            _key: 'person7',
            firstName: 'HasAStatus',
            status: 'MIA'
          },
          {
            _key: 'person8',
            firstName: 'EmptyStatus',
            status: ''
          },
          {
            _key: 'person9',
            firstName: 'NoCruft'
          }
        ]
      }
    ])
    await executeMigration({ direction: 'up' })
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when field is empty string', () => {
    it('removes `title` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'EmptyTitle' })

      expect(person).to.not.have.property('title')
    })

    it('removes `type` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'EmptyType' })

      expect(person).to.not.have.property('type')
    })

    it('removes `status` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'EmptyStatus' })

      expect(person).to.not.have.property('status')
    })

    it('removes `company` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'EmptyCompany' })

      expect(person).to.not.have.property('status')
    })
  })

  describe('when field is not an empty string', () => {
    it('does not affect `title` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'HasATitle' })

      expect(person).to.have.property('title')
    })

    it('does not affect `type` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'HasAType' })

      expect(person).to.have.property('type')
    })

    it('does not affect `status` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'HasAStatus' })

      expect(person).to.have.property('status')
    })

    it('does not affect `company` field', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'HasACompany' })

      expect(person).to.have.property('company')
    })
  })

  describe('when field is undefined', () => {
    it('does not update the entity', async () => {
      const people = await fetchAll(db, 'people')
      const person = find(people, { firstName: 'NoCruft' })

      expect(person).to.have.property('_key').to.equal('person9')
      expect(person).to.not.have.property('title')
      expect(person).to.not.have.property('type')
      expect(person).to.not.have.property('status')
      expect(person).to.not.have.property('company')
    })
  })
})
