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
const migration = require('../../../../migrations/00027-convert-question-name-to-slug')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe('00027 Convert question name to slug', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['surveyQuestions'])
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
          name: 'surveyQuestions',
          data: [
            {
              _key: 'surveyQuestions1',
              title: 'Some question',
              name: 'some-name',
              survey: 'survey1'
            },
            {
              _key: 'surveyQuestions2',
              title: 'Some question',
              name: 'some-name2',
              survey: 'survey1'
            }
          ]
        }
      ])
      await executeMigration({ direction: 'up' })
    })

    it('should remove the name property', async () => {
      const data = await fetchAll(db, 'surveyQuestions')
      const surveyQuestions = orderBy(data, ['_key'])
      expect(surveyQuestions[0]).to.not.have.property('name')
      expect(surveyQuestions[1]).to.not.have.property('name')
    })

    it('should add slug property', async () => {
      const data = await fetchAll(db, 'surveyQuestions')
      const surveyQuestions = orderBy(data, ['_key'])
      expect(surveyQuestions[0]).to.have.property('slug').to.equal('some-question')
    })

    describe('when question titles clash', () => {
      it('should generate slug with hash on the end', async () => {
        const data = await fetchAll(db, 'surveyQuestions')
        const surveyQuestions = orderBy(data, ['_key'])
        expect(surveyQuestions[1]).to.have.property('slug').to.match(/some-question-[a-zA-Z0-9]{8}/)
      })
    })
  })

  describe('down', () => {
    beforeEach(async () => {
      await populateCollections(db, [
        {
          name: 'surveyQuestions',
          data: [
            {
              _key: 'surveyQuestions1',
              title: 'Some question',
              slug: 'some-question',
              survey: 'survey1'
            },
            {
              _key: 'surveyQuestions2',
              title: 'Some question',
              slug: 'some-question-abcd1234',
              survey: 'survey1'
            }
          ]
        }
      ])
      await executeMigration({ direction: 'down' })
    })

    it('should remove the name property', async () => {
      const data = await fetchAll(db, 'surveyQuestions')
      const surveyQuestions = orderBy(data, ['_key'])
      expect(surveyQuestions[0]).to.not.have.property('slug')
      expect(surveyQuestions[1]).to.not.have.property('slug')
    })

    it('should rename slug property to name', async () => {
      const data = await fetchAll(db, 'surveyQuestions')
      const surveyQuestions = orderBy(data, ['_key'])
      expect(surveyQuestions[0]).to.have.property('name').to.equal('some-question')
      expect(surveyQuestions[1]).to.have.property('name').to.equal('some-question-abcd1234')
    })
  })
})
