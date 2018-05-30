const promiseSerial = require('promise-serial')

const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Add companySurveys collection', async () => {
    const companySurveysCollection = db.collection('companySurveys')
    try {
      await companySurveysCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }

    const surveysCollection = await db.collection('surveys')
    const surveys = await fetchAll(db, 'surveys')
    await promiseSerial(surveys.map(survey => async () => {
      await companySurveysCollection.save({
        company: survey.company,
        survey: survey._key
      })
      await surveysCollection.update(survey._key, {
        company: null
      }, { keepNull: false })
    }))
  })
}

async function down ({ db, step }) {
  try {
    const companySurveysCollection = db.collection('companySurveys')
    const surveysCollection = await db.collection('surveys')
    const companySurveys = await fetchAll(db, 'companySurveys')
    await promiseSerial(companySurveys.map(companySurvey => async () => {
      await surveysCollection.update(companySurvey.survey, {
        company: companySurvey.company
      })
    }))
    await companySurveysCollection.drop()
  } catch (error) {
    if (error.message !== 'collection not found (companySurveys)') {
      throw error
    }
  }
}

module.exports = { up, down }
