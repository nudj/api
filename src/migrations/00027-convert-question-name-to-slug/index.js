const promiseSerial = require('promise-serial')

const { fetchAll } = require('../../lib')
const makeUniqueSlug = require('../../gql/lib/helpers/make-unique-slug')
const { store: setupStore } = require('../../gql/adaptors/arango')
const setupDataLoaderCache = require('../../gql/lib/setup-dataloader-cache')

async function up ({ db, step }) {
  const store = setupStore({ db, getDataLoader: setupDataLoaderCache(db, {}) })
  const context = { store }

  await step('Convert surveyQuestion name to slug', async () => {
    const collection = db.collection('surveyQuestions')
    const surveyQuestions = await fetchAll(db, 'surveyQuestions')

    await promiseSerial(surveyQuestions.map(surveyQuestion => async () => {
      if (surveyQuestion.name) {
        const slug = await makeUniqueSlug({
          type: 'surveyQuestions',
          data: surveyQuestion,
          context
        })
        return collection.update(surveyQuestion, {
          slug,
          name: null
        }, {
          keepNull: false
        })
      }
    }))
  })
}

async function down ({ db, step }) {
  await step('Revert surveyQuestion slug to name', async () => {
    const collection = db.collection('surveyQuestions')
    const surveyQuestions = await fetchAll(db, 'surveyQuestions')

    await Promise.all(surveyQuestions.map(async surveyQuestion => {
      if (surveyQuestion.slug) {
        return collection.update(surveyQuestion, {
          name: surveyQuestion.slug,
          slug: null
        }, {
          keepNull: false
        })
      }
    }))
  })
}

module.exports = { up, down }
