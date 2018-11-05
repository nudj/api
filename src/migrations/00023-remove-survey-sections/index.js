const promiseSerial = require('promise-serial')
const flatten = require('lodash/flatten')
const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Transfer `Survey.surveySections.surveyQuestions` to `Survey.surveyQuestions`', async () => {
    const surveysCollection = db.collection('surveys')
    const surveySectionsCollection = db.collection('surveySections')
    const surveys = await fetchAll(db, 'surveys')

    await promiseSerial(surveys.map(survey => async () => {
      const surveySections = await promiseSerial(
        survey.surveySections.map(surveySection => async () => {
          return surveySectionsCollection.document(surveySection)
        })
      )
      const surveyQuestions = flatten(surveySections.map(section => section.surveyQuestions))
      await surveysCollection.update(survey._key, {
        surveyQuestions,
        surveySections: null
      }, { keepNull: false })
    }))

    await step('Replace `SurveyQuestion.surveySection` with `SurveyQuestion.survey`', async () => {
      const surveySectionsCollection = db.collection('surveySections')
      const surveyQuestionsCollection = db.collection('surveyQuestions')
      const surveyQuestions = await fetchAll(db, 'surveyQuestions')

      await promiseSerial(surveyQuestions.map(question => async () => {
        const surveySection = await surveySectionsCollection.document(question.surveySection)

        await surveyQuestionsCollection.update(question._key, {
          survey: surveySection.survey,
          surveySection: null
        }, { keepNull: false })
      }))

      await step('Remove `surveySections` collection', async () => {
        try {
          const collection = db.collection('surveySections')
          await collection.drop()
        } catch (error) {
          if (error.message !== `unknown collection 'surveySections'`) {
            throw error
          }
        }
      })
    })
  })
}

async function down ({ db, step }) {
  const newISODate = () => (new Date()).toISOString()

  await step('Restores `surveySections` collection', async () => {
    try {
      const collection = db.collection('surveySections')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })

  await step('Restores `surveySections` relations', async () => {
    const surveysCollection = db.collection('surveys')
    const surveySectionsCollection = db.collection('surveySections')
    const surveys = await fetchAll(db, 'surveys')

    await promiseSerial(surveys.map(survey => async () => {
      const { new: surveySection } = await surveySectionsCollection.save({
        created: newISODate(),
        modified: newISODate(),
        description: '',
        title: '',
        survey: survey._key,
        surveyQuestions: survey.surveyQuestions
      }, { returnNew: true })

      await surveysCollection.update(survey._key, {
        surveySections: [ surveySection._key ],
        surveyQuestions: null
      }, { keepNull: false })
    }))
  })

  await step('Removes direct relations between `Survey` and `SurveyQuestion` entities', async () => {
    const surveyQuestionsCollection = db.collection('surveyQuestions')
    const surveysCollection = db.collection('surveys')
    const surveyQuestions = await fetchAll(db, 'surveyQuestions')

    await promiseSerial(surveyQuestions.map(question => async () => {
      const survey = await surveysCollection.document(question.survey)

      await surveyQuestionsCollection.update(question._key, {
        survey: null,
        surveySection: survey.surveySections[0]
      }, { keepNull: false })
    }))
  })
}

module.exports = { up, down }
