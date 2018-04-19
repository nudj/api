/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00009-add-hirer-types')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

chai.use(chaiAsPromised)

describe('00009 Add Hirer Types', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['hirers'])
    await populateCollections(db, [
      {
        name: 'hirers',
        data: [
          {
            id: 'hirer1',
            onboarded: true,
            person: 'person1',
            company: 'company1'
          },
          {
            id: 'hirer2',
            onboarded: false,
            person: 'person2',
            company: 'company2'
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

    it('should add the `type` property with value `ADMIN` to all hirers', async () => {
      const hirersCollection = db.collection('hirers')
      const allHirersCursor = await hirersCollection.all()
      const allHirers = await allHirersCursor.all()

      expect(allHirers[0]).to.have.property('type').to.equal(hirerTypes.ADMIN)
      expect(allHirers[1]).to.have.property('type').to.equal(hirerTypes.ADMIN)
    })
  })

  describe('when direction down', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('should remove the `type` property from all hirers', async () => {
      const hirersCollection = db.collection('hirers')
      const allHirersCursor = await hirersCollection.all()
      const allHirers = await allHirersCursor.all()

      expect(allHirers[0]).to.not.have.property('type')
      expect(allHirers[1]).to.not.have.property('type')
    })
  })
})
