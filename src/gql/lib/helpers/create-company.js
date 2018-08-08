const omitBy = require('lodash/omitBy')
const omit = require('lodash/omit')
const isUndefined = require('lodash/isUndefined')

const { possessiveCase } = require('@nudj/library')

const makeUniqueSlug = require('./make-unique-slug')
const createJob = require('./create-job')
const prismic = require('../prismic')
const { enrichOrFetchEnrichedCompanyByName } = require('../clearbit')
const { DUMMY_APPLICANT_EMAIL_ADDRESS } = require('../constants')
const { values: jobStatusTypes } = require('../../schema/enums/job-status-types')

const createCompany = async (context, companyData, options = {}) => {
  const {
    name,
    location,
    description,
    onboarded = false,
    client = false
  } = companyData

  const slug = await makeUniqueSlug({
    type: 'companies',
    data: companyData,
    context
  })

  const company = await context.sql.create({
    type: 'companies',
    filters: { name },
    data: omitBy({
      name,
      slug,
      location,
      description,
      client,
      onboarded
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
      title: `${possessiveCase(company.name)} First Job`,
      status: jobStatusTypes.DRAFT
    })

    const dummyApplicant = await context.sql.readOne({
      type: 'people',
      filters: { email: DUMMY_APPLICANT_EMAIL_ADDRESS }
    })

    await context.sql.create({
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
