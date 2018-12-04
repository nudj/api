const omitBy = require('lodash/omitBy')
const omit = require('lodash/omit')
const isUndefined = require('lodash/isUndefined')
const mapKeys = require('lodash/mapKeys')
const camelCase = require('lodash/camelCase')
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

  const company = await context.sql.create({
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
    // Create dummy job
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

    // Create dummy application
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

    // Create default survey
    const [ defaultSurvey ] = await prismic.fetchContent({
      type: 'default-survey',
      tags: ['default-survey'],
      keys: {
        introTitle: 'intro_title',
        slug: 'survey_slug',
        introDescription: 'intro_description',
        status: 'status',
        questions: 'questions'
      }
    })
    const survey = await context.sql.create({
      type: 'surveys',
      data: mapKeys(omit(defaultSurvey, [
        'questions',
        'tags'
      ]), (value, key) => camelCase(key))
    })
    const questions = await Promise.all(defaultSurvey.questions.map(question => {
      return context.sql.create({
        type: 'surveyQuestions',
        data: {
          ...question,
          survey: survey.id,
          required: true
        }
      })
    }))
    await Promise.all([
      context.sql.update({
        type: 'surveys',
        id: survey.id,
        data: {
          questions: JSON.stringify(questions.map(q => q.id))
        }
      }),
      context.sql.create({
        type: 'companySurveys',
        data: {
          survey: survey.id,
          company: company.id
        }
      })
    ])
  }

  return company
}

module.exports = createCompany
