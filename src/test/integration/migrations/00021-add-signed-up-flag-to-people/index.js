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
    await setupCollections(db, ['people', 'referrals', 'hirers', 'applications'])
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
            },
            {
              _key: 'person4'
            },
            {
              _key: 'person5'
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
        },
        {
          name: 'applications',
          data: [
            {
              _key: 'application1',
              created: '2018-08-15T12:00:00.000+00:00',
              person: 'person3'
            },
            {
              _key: 'application2',
              created: '2018-08-29T12:00:00.000+00:00',
              person: 'person4'
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
    })

    it('adds the `signedUp` boolean `true` to people who have referrals', async () => {
      await executeMigration({ direction: 'up' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[1]).to.have.property('signedUp', true)
    })

    it('adds the `signedUp` boolean `true` to people who have old applications', async () => {
      await executeMigration({ direction: 'up' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[2]).to.have.property('signedUp', true) // before Auth0 was removed
      expect(people[3]).to.not.have.property('signedUp') // post Auth0 removal
    })

    it('does not add the `signedUp` boolean `true` to all other people', async () => {
      await executeMigration({ direction: 'up' })
      const cursor = await db.collection('people').all()
      const people = orderBy(await cursor.all(), '_key')

      expect(people[4]).to.not.have.property('signedUp')
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
