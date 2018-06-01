const promiseSerial = require('promise-serial')

const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Convert Job.bonus to String', async () => {
    const jobsCollection = db.collection('jobs')
    const jobs = await fetchAll(db, 'jobs')
    await promiseSerial(jobs.map(job => async () => {
      if (job.bonus[0] !== '£') {
        await jobsCollection.update(job._key, {
          bonus: `£${job.bonus}`
        })
      }
    }))
  })
}

async function down ({ db, step }) {
  await step('Revert Job.bonus back to an Int', async () => {
    const jobsCollection = db.collection('jobs')
    const jobs = await fetchAll(db, 'jobs')
    await promiseSerial(jobs.map(job => async () => {
      if (typeof job.bonus === 'string') {
        await jobsCollection.update(job._key, {
          bonus: parseInt(job.bonus.slice(1), 10)
        })
      }
    }))
  })
}

module.exports = { up, down }
