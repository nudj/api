/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')

const { fetchAll } = require('../../../../lib')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00023-remove-survey-sections')

chai.use(chaiAsPromised)

describe('00023 Remove Survey Sections', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['surveys', 'surveySections', 'surveyQuestions'])
    await populateCollections(db, [
      {
        name: 'surveys',
        data: [
          {
            _key: 'survey1',
            surveySections: [
              'surveySection1'
            ]
          },
          {
            _key: 'survey2',
            surveySections: [
              'surveySection2',
              'surveySection3'
            ]
          }
        ]
      },
      {
        name: 'surveySections',
        data: [
          {
            _key: 'surveySection1',
            survey: 'survey1',
            surveyQuestions: [
              'surveyQuestion1',
              'surveyQuestion2'
            ]
          },
          {
            _key: 'surveySection2',
            survey: 'survey2',
            surveyQuestions: [
              'surveyQuestion3',
              'surveyQuestion4'
            ]
          },
          {
            _key: 'surveySection3',
            survey: 'survey2',
            surveyQuestions: [
              'surveyQuestion5',
              'surveyQuestion6',
              'surveyQuestion7'
            ]
          }
        ]
      },
      {
        name: 'surveyQuestions',
        data: [
          {
            _key: 'surveyQuestion1',
            surveySection: 'surveySection1'
          },
          {
            _key: 'surveyQuestion2',
            surveySection: 'surveySection1'
          },
          {
            _key: 'surveyQuestion3',
            surveySection: 'surveySection2'
          },
          {
            _key: 'surveyQuestion4',
            surveySection: 'surveySection2'
          },
          {
            _key: 'surveyQuestion5',
            surveySection: 'surveySection3'
          },
          {
            _key: 'surveyQuestion6',
            surveySection: 'surveySection3'
          },
          {
            _key: 'surveyQuestion7',
            surveySection: 'surveySection3'
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

  describe('up', () => {
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
    })

    it('Adds `surveyQuestions` array to `Survey` entities', async () => {
      const surveys = orderBy(await fetchAll(db, 'surveys'), '_key')

      expect(surveys[0].surveyQuestions).to.deep.equal([
        'surveyQuestion1',
        'surveyQuestion2'
      ])
      expect(surveys[1].surveyQuestions).to.deep.equal([
        'surveyQuestion3',
        'surveyQuestion4',
        'surveyQuestion5',
        'surveyQuestion6',
        'surveyQuestion7'
      ])
    })

    it('Removes `surveySections` array from `Survey` entities', async () => {
      const surveys = await fetchAll(db, 'surveys')

      surveys.forEach(survey => {
        expect(survey.surveySections).to.be.undefined()
      })
    })

    it('Adds `survey` id to `SurveyQuestion` entities', async () => {
      const surveyQuestions = orderBy(
        await fetchAll(db, 'surveyQuestions'), '_key'
      )

      expect(surveyQuestions[0].survey).to.equal('survey1')
      expect(surveyQuestions[1].survey).to.equal('survey1')
      expect(surveyQuestions[2].survey).to.equal('survey2')
      expect(surveyQuestions[3].survey).to.equal('survey2')
      expect(surveyQuestions[4].survey).to.equal('survey2')
      expect(surveyQuestions[5].survey).to.equal('survey2')
      expect(surveyQuestions[6].survey).to.equal('survey2')
    })

    it('Removes `surveySection` id from `SurveyQuestion` entities', async () => {
      const surveyQuestions = orderBy(
        await fetchAll(db, 'surveyQuestions'), '_key'
      )

      surveyQuestions.forEach(question => {
        expect(question.surveySection).to.be.undefined()
      })
    })

    it('Removes `surveySections` collection', async () => {
      try {
        const collection = db.collection('surveySections')
        await collection.all()
        throw new Error('Should have already errored')
      } catch (error) {
        expect(error.message).to.equal('collection not found (surveySections)')
      }
    })
  })

  describe('down', () => {
    const idRegex = /([0-9]){8}/
    beforeEach(async () => {
      await executeMigration({ direction: 'up' })
      await executeMigration({ direction: 'down' })
    })

    it('Restores `surveySections` collection', async () => {
      const collection = db.collection('surveySections')
      const surveySections = await collection.all()
      expect(surveySections).to.exist()
    })

    it('Adds `surveySection` id to `SurveyQuestion` entities', async () => {
      const surveyQuestions = orderBy(
        await fetchAll(db, 'surveyQuestions'), '_key'
      )

      surveyQuestions.forEach(question => {
        expect(question).to.have.property('surveySection').to.match(idRegex)
      })
    })

    it('Removes `survey` id from `SurveyQuestion` entities', async () => {
      const surveyQuestions = orderBy(
        await fetchAll(db, 'surveyQuestions'), '_key'
      )

      surveyQuestions.forEach(question => {
        expect(question).to.not.have.property('survey')
      })
    })

    it('Replaces `Survey.surveyQuestions` with `Survey.surveySections`', async () => {
      const surveys = orderBy(
        await fetchAll(db, 'surveys'), '_key'
      )

      expect(surveys[0]).to.not.have.property('surveyQuestions')
      expect(surveys[0].surveySections).to.have.property('length', 1)
      expect(surveys[0].surveySections[0]).to.match(idRegex)

      expect(surveys[1]).to.not.have.property('surveyQuestions')
      expect(surveys[1].surveySections).to.have.property('length', 1)
      expect(surveys[1].surveySections[0]).to.match(idRegex)
    })
  })
})
