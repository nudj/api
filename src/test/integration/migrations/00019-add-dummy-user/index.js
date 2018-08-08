/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const { DUMMY_APPLICANT_EMAIL_ADDRESS } = require('../../../../gql/lib/constants')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00019-add-dummy-user')

chai.use(chaiAsPromised)

describe('00019 Add dummy user for mock data', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['people'])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    it('should add the dummy user', async () => {
      await executeMigration({ direction: 'up' })
      const collection = db.collection('people')
      const cursor = await collection.byExample({
        email: DUMMY_APPLICANT_EMAIL_ADDRESS
      })
      const dummyPerson = await cursor.next()

      expect(dummyPerson).to.exist()
      expect(dummyPerson).to.have.property('firstName')
      expect(dummyPerson).to.have.property('lastName')
      expect(dummyPerson).to.have.property('created')
      expect(dummyPerson).to.have.property('modified')
      expect(dummyPerson).to.have.property('email', DUMMY_APPLICANT_EMAIL_ADDRESS)
    })
  })

  describe('down', () => {
    beforeEach(async () => {
      await populateCollections(db, [
        {
          name: 'people',
          data: [
            {
              _key: 'dummyPerson1',
              email: DUMMY_APPLICANT_EMAIL_ADDRESS
            }
          ]
        }
      ])
    })

    it('should remove the dummy user', async () => {
      await executeMigration({ direction: 'down' })
      const collection = db.collection('people')
      const cursor = await collection.byExample({
        email: DUMMY_APPLICANT_EMAIL_ADDRESS
      })
      const dummyPerson = await cursor.next()

      expect(dummyPerson).to.not.exist()
    })
  })
})
