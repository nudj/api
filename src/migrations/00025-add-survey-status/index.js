const { values: surveyStatuses } = require('../../gql/schema/enums/survey-status-types')
const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Add `status` property on existing surveys with value `PUBLISHED`', async () => {
    const surveysCollection = db.collection('surveys')
    const allSurveys = await fetchAll(db, 'surveys')
    await Promise.all(allSurveys.map(survey => surveysCollection.update(survey, {
      status: surveyStatuses.PUBLISHED
    })))
  })
}

async function down ({ db, step }) {
  await step('Remove `status` property from surveys', async () => {
    const surveysCollection = db.collection('surveys')
    const allSurveys = await fetchAll(db, 'surveys')
    await Promise.all(allSurveys.map(survey => surveysCollection.update(survey, {
      status: null
    }, { keepNull: false })))
  })
}

module.exports = { up, down }
