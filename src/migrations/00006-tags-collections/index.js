async function up ({ db, step }) {
  await step('Create entityTags collection', async () => {
    try {
      const collection = db.collection('entityTags')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })

  await step('Create tags collection', async () => {
    try {
      const collection = db.collection('tags')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })

  await step('Add empty `tags` arrays to surveyQuestions', async () => {
    const surveyQuestionsCollection = db.collection('surveyQuestions')
    const allSurveyQuestions = await surveyQuestionsCollection.all()
    await allSurveyQuestions.each(async question => {
      if (!question.tags) {
        return surveyQuestionsCollection.update(question, {
          tags: []
        })
      }
    })
  })
}

async function down ({ db, step }) {
  await step('Remove entityTags collection', async () => {
    try {
      const collection = db.collection('entityTags')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'entityTags'`) {
        throw error
      }
    }
  })

  await step('Remove tags collection', async () => {
    try {
      const collection = db.collection('tags')
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'tags'`) {
        throw error
      }
    }
  })

  await step('Remove empty `tags` arrays from surveyQuestions', async () => {
    const surveyQuestionsCollection = db.collection('surveyQuestions')
    const allSurveyQuestions = await surveyQuestionsCollection.all()
    await allSurveyQuestions.each(async question => {
      if (question.tags && question.tags.length === 0) {
        return surveyQuestionsCollection.update(question, {
          tags: null
        }, { keepNull: false })
      }
    })
  })
}

module.exports = { up, down }
