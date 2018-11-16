const omitBy = require('lodash/omitBy')
const omit = require('lodash/omit')
const isUndefined = require('lodash/isUndefined')
const generateHash = require('hash-generator')

const makeUniqueSlug = require('./make-unique-slug')
const createJob = require('./create-job')
const { enrichOrFetchEnrichedCompanyByName } = require('../clearbit')
const prismic = require('../prismic')
const { DUMMY_APPLICANT_EMAIL_ADDRESS } = require('../constants')
const { values: jobStatusTypes } = require('../../schema/enums/job-status-types')

const createCompany = async (context, companyData, options = {}) => {
  const {
    name,
    location,
    description,
    onboarded = false,
    client = false,
    syncing = false
  } = companyData

  const slug = await makeUniqueSlug({
    type: 'companies',
    data: companyData,
    context
  })

  const company = await context.store.create({
    type: 'companies',
    filters: { name },
    data: omitBy({
      name,
      slug,
      location,
      description,
      client,
      onboarded,
      syncing,
      hash: generateHash(128)
    }, isUndefined)
  })
  enrichOrFetchEnrichedCompanyByName(company, context)

  if (options.createDummyData) {
    // Fetch dummy job copy
    const [ jobData ] = await prismic.fetchContent({
      type: 'mock-job',
      tags: ['mock-job'],
      keys: {
        title: 'title',
        bonus: 'bonus',
        location: 'location',
        type: 'type',
        description: 'description'
      }
    })
    const job = await createJob(context, company, {
      ...omit(jobData, ['tags']), // Omit prismic tags
      templateTags: [],
      status: jobStatusTypes.DRAFT
    })

    const dummyApplicant = await context.store.readOne({
      type: 'people',
      filters: { email: DUMMY_APPLICANT_EMAIL_ADDRESS }
    })

    await context.store.create({
      type: 'applications',
      data: {
        person: dummyApplicant.id,
        job: job.id,
        referral: null
      }
    })
  }

  return company
}

module.exports = createCompany
