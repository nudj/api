const collections = [
  'jobTags',
  'surveyQuestionTags'
]

async function up ({ db, step }) {
  await step('Create new collections', async () => {
    await Promise.all(collections.map(async name => {
      try {
        const collection = db.collection(name)
        await collection.create()
      } catch (error) {
        if (error.message !== 'duplicate name: duplicate name') {
          throw error
        }
      }
    }))
  })

  await step('Divide jobTags and surveyQuestionTags into separate collections', async () => {
    const entityTagsCollection = db.collection('entityTags')
    const jobTagsCollection = db.collection('jobTags')
    const surveyQuestionTagsCollection = db.collection('surveyQuestionTags')
    const jobEntityTagsCursor = await entityTagsCollection.byExample({
      entityType: 'job'
    })
    const questionEntityTagsCursor = await entityTagsCollection.byExample({
      entityType: 'surveyQuestion'
    })
    const [
      jobEntityTags,
      questionEntityTags
    ] = await Promise.all([
      jobEntityTagsCursor.all(),
      questionEntityTagsCursor.all()
    ])

    await Promise.all(jobEntityTags.map(jobTag => {
      const { source, created, modified, entityId, tagId } = jobTag
      return jobTagsCollection.save({
        job: entityId,
        tag: tagId,
        source,
        created,
        modified
      })
    }))

    await Promise.all(questionEntityTags.map(surveyQuestionTag => {
      const { source, created, modified, entityId, tagId } = surveyQuestionTag
      return surveyQuestionTagsCollection.save({
        surveyQuestion: entityId,
        tag: tagId,
        source,
        created,
        modified
      })
    }))
  })

  await step('Remove entityTags collection', async () => {
    try {
      const collection = db.collection('entityTags')
      await collection.drop()
    } catch (error) {
      if (error.message !== 'unknown collection \'entityTags\'') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
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

  await step('Combine jobTags and surveyQuestionTags into entityTags collection', async () => {
    const entityTagsCollection = db.collection('entityTags')
    const jobTagsCollection = db.collection('jobTags')
    const surveyQuestionTagsCollection = db.collection('surveyQuestionTags')

    const jobTagsCursor = await jobTagsCollection.all()
    const surveyQuestionTagsCursor = await surveyQuestionTagsCollection.all()
    const [
      jobTags,
      surveyQuestionTags
    ] = await Promise.all([
      jobTagsCursor.all(),
      surveyQuestionTagsCursor.all()
    ])

    await Promise.all(jobTags.map(jobTag => {
      const { source, created, modified, job, tag } = jobTag
      return entityTagsCollection.save({
        entityId: job,
        entityType: 'job',
        tagId: tag,
        source,
        created,
        modified
      })
    }))

    await Promise.all(surveyQuestionTags.map(surveyQuestionTag => {
      const { source, created, modified, surveyQuestion, tag } = surveyQuestionTag
      return entityTagsCollection.save({
        entityId: surveyQuestion,
        entityType: 'surveyQuestion',
        tagId: tag,
        source,
        created,
        modified
      })
    }))
  })

  await step('Remove added collections', async () => {
    return Promise.all(collections.map(async name => {
      try {
        const collection = db.collection(name)
        await collection.drop()
      } catch (error) {
        if (error.message !== `unknown collection '${name}'`) {
          throw error
        }
      }
    }))
  })
}

module.exports = { up, down }
