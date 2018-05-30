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
const migration = require('../../../../migrations/00014-add-company-surveys-collection')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00014 Add companySurveys collection', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('up', () => {
    describe('when migration has not been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [
          'companies',
          'surveys'
        ])
        await populateCollections(db, [
          {
            name: 'companies',
            data: [
              {
                _key: 'company1'
              }
            ]
          },
          {
            name: 'surveys',
            data: [
              {
                _key: 'survey1',
                company: 'company1'
              }
            ]
          }
        ])
      })

      it('should add the collection', async () => {
        await executeMigration({ direction: 'up' })
        const collection = db.collection('companySurveys')
        const data = await collection.get()
        expect(data).to.exist()
      })

      it('should add an entry for every company-survey relation', async () => {
        await executeMigration({ direction: 'up' })
        const companySurveys = await fetchAll(db, 'companySurveys')
        expect(companySurveys).to.have.length(1)
      })

      it('should store a representation of the company-survey relation', async () => {
        await executeMigration({ direction: 'up' })
        const companySurveys = await fetchAll(db, 'companySurveys')
        expect(companySurveys[0]).to.have.property('company', 'company1')
        expect(companySurveys[0]).to.have.property('survey', 'survey1')
      })

      it('should remove the company property from the survey', async () => {
        await executeMigration({ direction: 'up' })
        const surveys = await fetchAll(db, 'surveys')
        expect(surveys[0]).to.not.have.property('company')
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [
          'companies',
          'surveys',
          'companySurveys'
        ])
        await populateCollections(db, [
          {
            name: 'companies',
            data: [
              {
                _key: 'company1'
              }
            ]
          },
          {
            name: 'surveys',
            data: [
              {
                _key: 'survey1'
              }
            ]
          },
          {
            name: 'companySurveys',
            data: [
              {
                _key: 'companySurvey1',
                company: 'company1',
                survey: 'survey1'
              }
            ]
          }
        ])
      })

      it('should not reject', async () => {
        await setupCollections(db, ['companySurveys'])
        await expect(executeMigration({ direction: 'up' })).to.eventually.be.fulfilled()
      })
    })
  })

  describe('down', () => {
    describe('when migration has not been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [
          'companies',
          'surveys',
          'companySurveys'
        ])
        await populateCollections(db, [
          {
            name: 'companies',
            data: [
              {
                _key: 'company1'
              }
            ]
          },
          {
            name: 'surveys',
            data: [
              {
                _key: 'survey1'
              }
            ]
          },
          {
            name: 'companySurveys',
            data: [
              {
                _key: 'companySurvey1',
                company: 'company1',
                survey: 'survey1'
              }
            ]
          }
        ])
      })

      it('should restore the company property on the survey', async () => {
        await executeMigration({ direction: 'down' })
        const surveys = await fetchAll(db, 'surveys')
        expect(surveys[0]).to.have.property('company')
      })

      it('should remove the collection', async () => {
        await executeMigration({ direction: 'down' })
        const collection = db.collection('companySurveys')
        await expect(collection.get()).to.eventually.be.rejected()
      })
    })

    describe('when up has already been run', () => {
      beforeEach(async () => {
        await setupCollections(db, [
          'companies',
          'surveys'
        ])
        await populateCollections(db, [
          {
            name: 'companies',
            data: [
              {
                _key: 'company1'
              }
            ]
          },
          {
            name: 'surveys',
            data: [
              {
                _key: 'survey1',
                company: 'company1'
              }
            ]
          }
        ])
      })

      it('should not reject', async () => {
        await expect(executeMigration({ direction: 'down' })).to.eventually.be.fulfilled()
      })
    })
  })
})
