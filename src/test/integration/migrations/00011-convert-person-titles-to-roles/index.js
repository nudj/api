/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00011-convert-person-titles-to-roles')

chai.use(chaiAsPromised)

describe('00011 Convert Person titles to Roles', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['roles', 'people'])
    await populateCollections(db, [
      {
        name: 'roles',
        data: [
          {
            _key: 'role1',
            name: 'Superhero'
          },
          {
            _key: 'role2',
            name: 'Firefighter'
          }
        ]
      },
      {
        name: 'people',
        data: [
          {
            _key: 'person1',
            title: 'Firefighter'
          },
          {
            _key: 'person2',
            title: 'Medic'
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

    it('should create the `personRoles` collection', async () => {
      const personRolesCollection = db.collection('personRoles')
      const personRoles = await personRolesCollection.all()

      expect(personRoles).to.exist()
    })

    describe('when `role` derived from `Person.title` exists', () => {
      it('should create the related `personRole` entities', async () => {
        const personRolesCollection = db.collection('personRoles')
        const personRolesCursor = await personRolesCollection.all()
        const personRoles = orderBy(await personRolesCursor.all(), ['person'])

        expect(personRoles[0]).to.have.property('person').to.equal('person1')
        expect(personRoles[0]).to.have.property('role').to.equal('role2')
        expect(personRoles[0]).to.have.property('current').to.be.true()
      })
    })

    describe('when `role` derived from `Person.title` does not exist', () => {
      it('should create the `role` & `personRole` entities', async () => {
        const personRolesCollection = db.collection('personRoles')
        const personRolesCursor = await personRolesCollection.all()
        const personRoles = orderBy(await personRolesCursor.all(), ['person'])

        expect(personRoles[1]).to.have.property('person').to.equal('person2')
        expect(personRoles[1]).to.have.property('role').to.be.a('string')
        expect(personRoles[1]).to.have.property('current').to.be.true()
      })
    })
  })

  describe('when direction down', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('should create `Person.title` fields for each `personRole`', async () => {
      const personCollection = db.collection('people')
      const personCursor = await personCollection.all()
      const people = orderBy(await personCursor.all(), ['title'])

      expect(people[0]).to.have.property('_key').to.equal('person1')
      expect(people[0]).to.have.property('title').to.equal('Firefighter')
      expect(people[1]).to.have.property('_key').to.equal('person2')
      expect(people[1]).to.have.property('title').to.equal('Medic')
    })

    it('should remove the `personRoles` collection', async () => {
      try {
        const personRolesCollection = db.collection('personRoles')
        await personRolesCollection.all()
        throw new Error('Should not reach this point')
      } catch (error) {
        expect(error.message).to.equal('collection not found (personRoles)')
      }
    })
  })
})
