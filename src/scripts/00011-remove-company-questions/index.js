const without = require('lodash/without')

const { values: SurveyQuestionTypes } = require('../../gql/schema/enums/survey-question-types')

async function action ({ db }) {
  const surveysCollection = db.collection('surveys')
  const questionsCollection = db.collection('surveyQuestions')
  const companyQuestionsCursor = await questionsCollection.byExample({
    type: SurveyQuestionTypes.COMPANIES
  })
  const companyQuestions = await companyQuestionsCursor.all()

  await Promise.all(companyQuestions.map(async companyQuestion => {
    const survey = await surveysCollection.document(companyQuestion.survey)
    await surveysCollection.update(survey, {
      surveyQuestions: without(survey.surveyQuestions, companyQuestion._key)
    })
    return questionsCollection.remove(companyQuestion)
  }))
}

module.exports = action
