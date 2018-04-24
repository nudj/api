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
const { fetchAll } = require('../../../../lib')
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
            _key: 'hirer1',
            onboarded: true,
            person: 'person1',
            company: 'company1'
          },
          {
            _key: 'hirer2',
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
      const allHirers = await fetchAll(db, 'hirers')
      const orderedHirers = orderBy(allHirers, ['_key'])

      expect(orderedHirers[0]).to.have.property('type').to.equal(hirerTypes.ADMIN)
      expect(orderedHirers[1]).to.have.property('type').to.equal(hirerTypes.ADMIN)
    })
  })

  describe('when direction down', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('should remove the `type` property from all hirers', async () => {
      const allHirers = await fetchAll(db, 'hirers')
      const orderedHirers = orderBy(allHirers, ['_key'])

      expect(orderedHirers[0]).to.not.have.property('type')
      expect(orderedHirers[1]).to.not.have.property('type')
    })
  })
})
