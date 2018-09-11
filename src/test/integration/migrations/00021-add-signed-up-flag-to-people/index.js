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
const migration = require('../../../../migrations/00021-add-signed-up-flag-to-people')

chai.use(chaiAsPromised)

describe('00021 Add signed up flag to people', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  before(async () => {
    await setupCollections(db, ['people', 'referrals', 'hirers'])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    beforeEach(async () => {
      await populateCollections(db, [
        {
          name: 'people',
          data: [
            {
              _key: 'person1'
            },
            {
              _key: 'person2'
            },
            {
              _key: 'person3'
            }
          ]
        },
        {
          name: 'referrals',
          data: [
            {
              _key: 'referral1',
              person: 'person1'
            }
          ]
        },
        {
          name: 'hirers',
          data: [
            {
              _key: 'hirer1',
              person: 'person2'
            }
          ]
        }
      ])
    })

    it('adds the `signedUp` boolean `true` to people who are hirers', async () => {
      await executeMigration({ direction: 'up' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[0]).to.have.property('signedUp', true)
      expect(people[2]).to.not.have.property('signedUp')
    })

    it('adds the `signedUp` boolean `true` to people who have referrals', async () => {
      await executeMigration({ direction: 'up' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[1]).to.have.property('signedUp', true)
      expect(people[2]).to.not.have.property('signedUp')
    })
  })

  describe('down', () => {
    beforeEach(async () => {
      await populateCollections(db, [
        {
          name: 'people',
          data: [
            {
              _key: 'person1',
              signedUp: true
            },
            {
              _key: 'person2',
              signedUp: true
            },
            {
              _key: 'person3'
            }
          ]
        }
      ])
    })

    it('removes the `signedUp` boolean `true` from all people', async () => {
      await executeMigration({ direction: 'down' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[0]).to.not.have.property('signedUp')
      expect(people[1]).to.not.have.property('signedUp')
      expect(people[2]).to.not.have.property('signedUp')
    })
  })
})
