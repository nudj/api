async function up ({ db, step }) {
  await step('Create new collections', async () => {
    await Promise.all([
      'entityTags',
      'tags'
    ].map(async name => {
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

  await step('Add empty `entityTags` arrays to tagged collections', async () => {
    const surveyQuestionsCollection = db.collection('surveyQuestions')
    const jobsCollection = db.collection('jobs')
    const allSurveyQuestions = await surveyQuestionsCollection.all()
    const allJobs = await jobsCollection.all()
    await Promise.all([
      allSurveyQuestions.each(async question => {
        if (!question.entityTags) {
          return surveyQuestionsCollection.update(question, {
            entityTags: []
          })
        }
      }),
      allJobs.each(async job => {
        if (!job.entityTags) {
          return jobsCollection.update(job, {
            entityTags: []
          })
        }
      })
    ])
  })

  await step('Rename `job.tags` to `job.labels`', async () => {
    const jobsCollection = db.collection('jobs')
    const allJobs = await jobsCollection.all()
    await allJobs.each(async job => {
      if (job.tags && !job.labels) {
        return jobsCollection.update(job, {
          labels: job.tags,
          tags: null
        }, { keepNull: false })
      }
    })
  })
}

async function down ({ db, step }) {
  await step('Remove new collections', async () => {
    await Promise.all([
      'entityTags',
      'tags'
    ].map(async name => {
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

  await step('Remove empty `entityTags` arrays from tagged collections', async () => {
    const surveyQuestionsCollection = db.collection('surveyQuestions')
    const jobsCollection = db.collection('jobs')
    const allSurveyQuestions = await surveyQuestionsCollection.all()
    const allJobs = await jobsCollection.all()
    await Promise.all([
      allSurveyQuestions.each(async question => {
        if (question.entityTags && !question.entityTags.length) {
          return surveyQuestionsCollection.update(question, {
            entityTags: null
          }, { keepNull: false })
        }
      }),
      allJobs.each(async job => {
        if (job.entityTags && !job.entityTags.length) {
          return jobsCollection.update(job, {
            entityTags: null
          }, { keepNull: false })
        }
      })
    ])
  })

  await step('Restore `job.labels` to `job.tags`', async () => {
    const jobsCollection = db.collection('jobs')
    const allJobs = await jobsCollection.all()
    await allJobs.each(async job => {
      if (job.labels && !job.tags) {
        return jobsCollection.update(job, {
          tags: job.labels,
          labels: null
        }, { keepNull: false })
      }
    })
  })
}

module.exports = { up, down }
