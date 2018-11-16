const get = require('lodash/get')
const find = require('lodash/find')
const pull = require('lodash/pull')
const clone = require('lodash/cloneDeep')
const { omitUndefined } = require('@nudj/library')
const { values: hirerTypes } = require('../../schema/enums/hirer-types')
const { values: jobStatusTypes } = require('../../schema/enums/job-status-types')
const createJob = require('../helpers/create-job')

function fetchDiffList (externalJobs, nudjJobs) {
  let duplicateNudjJobs = clone(nudjJobs)

  const actions = externalJobs.reduce((actions, externalJob) => {
    const nudjVersionOfJob = find(duplicateNudjJobs, { externalId: externalJob.id })

    // If nudj has a version of the job, update it. Otherwise, create it.
    if (nudjVersionOfJob) {
      actions.update = actions.update.concat(externalJob.id)
      duplicateNudjJobs = pull(duplicateNudjJobs, nudjVersionOfJob)
    } else {
      actions.create = actions.create.concat(externalJob.id)
    }

    return actions
  }, {
    create: [],
    update: []
  })

  // Any jobs that we have a record of that the external source does not should be deleted
  actions.delete = duplicateNudjJobs.map(job => job.externalId)

  return actions
}

// Convert a GreenhouseJob.status to a NudjJob.status
const jobStatusConversions = {
  'open': jobStatusTypes.PUBLISHED,
  'closed': jobStatusTypes.ARCHIVED,
  'draft': jobStatusTypes.DRAFT
}

function syncWithGreenhouse ({ harvest }) {
  return async context => {
    const hirer = await context.store.readOne({
      type: 'hirers',
      filters: { person: context.userId }
    })

    // Ensure user has permissions to sync
    if (!hirer || hirer.type !== hirerTypes.ADMIN) {
      throw new Error('User does not have permissions to sync Greenhouse jobs')
    }

    const company = await context.store.readOne({
      type: 'companies',
      id: hirer.company
    })

    // Ensure company is not currently syncing
    if (company.syncing) {
      throw new Error('Greenhouse syncing is already in progress')
    }

    try {
      // Set `Company.syncing`
      await context.store.update({
        type: 'companies',
        id: hirer.company,
        data: { syncing: true }
      })

      // Fetch jobs and job posts from Greenhouse
      const [ greenhouseJobs, greenhouseJobPosts ] = await Promise.all([
        harvest.get('jobs', { confidential: false }),
        harvest.get('job_posts', { live: true, active: true })
      ])

      // Find any records in `atsJobs` table that point to the Greenhouse jobs for diff creation
      const atsJobs = await context.store.readAll({
        type: 'atsJobs',
        filters: { company: company.id }
      })

      // Create a diff list of actions that need to be performed, based on a comparison of data that we have and Greenhouse has.
      const actions = fetchDiffList(
        greenhouseJobs,
        atsJobs.filter(Boolean) // Remove any jobs fetch attempts that didn't succeed
      )

      // Create the new jobs
      await Promise.all(actions.create.map(async externalId => {
        const jobPost = find(greenhouseJobPosts, { job_id: externalId, external: true })
        const greenhouseJob = find(greenhouseJobs, { id: externalId })

        if (jobPost) {
          // Create new job based on existence of a relevant JobPost
          const job = await createJob(context, company, {
            title: jobPost.title,
            description: jobPost.content,
            location: (jobPost.location && jobPost.location.name) || '', // Field is required
            status: jobStatusConversions[greenhouseJob.status],
            type: 'PERMANENT',
            templateTags: []
          })
          await context.store.create({
            type: 'atsJobs',
            data: { externalId, jobId: job.id, company: hirer.company }
          })
        }
      }))

      // Update existing jobs
      await Promise.all(actions.update.map(async externalId => {
        const jobPost = find(greenhouseJobPosts, { job_id: externalId, external: true })
        const greenhouseJob = find(greenhouseJobs, { id: externalId })

        if (jobPost) {
          const atsJob = await context.store.readOne({
            type: 'atsJobs',
            filters: { externalId }
          })
          await context.store.update({
            type: 'jobs',
            id: atsJob.jobId,
            data: omitUndefined({
              title: jobPost.title,
              status: jobStatusConversions[greenhouseJob.status],
              description: jobPost.content,
              location: jobPost.location && jobPost.location.name
            })
          })
        }
      }))

      // "Delete" any superfluous nudj jobs
      await Promise.all(actions.delete.map(async externalId => {
        const { jobId } = find(atsJobs, { externalId })

        return context.store.update({
          type: 'jobs',
          id: jobId,
          data: { status: jobStatusTypes.DELETED }
        })
      }))

      // Complete syncing, remove flag from company
      await context.store.update({
        type: 'companies',
        id: hirer.company,
        data: { syncing: false }
      })

      return true
    } catch (err) {
      // Syncing has failed, but is still needs to be marked as "completed"
      await context.store.update({
        type: 'companies',
        id: hirer.company,
        data: { syncing: false }
      })

      const code = get(err, 'status') || get(err, 'code') || get(err, 'response.status') || 500
      const error = code === 429 ? new Error('Rate limit reached') : new Error(err.message)
      error.code = code

      throw error
    }
  }
}

module.exports = syncWithGreenhouse
