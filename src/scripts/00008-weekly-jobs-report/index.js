const filter = require('lodash/filter')
const flatten = require('lodash/flatten')
const groupBy = require('lodash/groupBy')
const subDays = require('date-fns/sub_days')
const startOfWeek = require('date-fns/start_of_week')
const endOfWeek = require('date-fns/end_of_week')
const { parse: parseToCSV } = require('json2csv')

const { fetchAll } = require('../../lib')
const { store: setupStore } = require('../../gql/adaptors/arango')
const setupDataLoaderCache = require('../../gql/lib/setup-dataloader-cache')
const { startOfDay, endOfDay } = require('../../gql/lib/format-dates')
const { values: jobStatusTypes } = require('../../gql/schema/enums/job-status-types')

// Checks for format of date eg., 2000-01-01
const dateRegex = /([0-9]){4}-([0-9]){2}-([0-9]){2}/
const totalTitle = 'Total'

const blankRow = {
  company: '',
  title: '',
  'views': '',
  'referral links': '',
  'applications': '',
  'lifetime views': '',
  'lifetime referral links': '',
  'lifetime applications': ''
}

function countTotal (data, key) {
  return flatten(data)
    .map(datum => {
      // Ignore section-specific totals
      if (!datum[key] || datum.title === totalTitle) return 0
      return datum[key]
    })
    .reduce((a, b) => a + b, 0)
}

function formatDateByWeek (dateInput) {
  const timestamp = dateInput || subDays(new Date(), 1).toISOString() // yesterday
  const startOfWeekTimestamp = startOfWeek(timestamp).toISOString()
  const endOfWeekTimestamp = endOfWeek(timestamp).toISOString()

  const date = startOfWeekTimestamp.slice(0, 10)
  const dateFilters = {
    dateFrom: startOfDay(startOfWeekTimestamp),
    dateTo: endOfDay(endOfWeekTimestamp)
  }

  return {
    dateFilters,
    date
  }
}

async function action ({ db, arg: specifiedDate }) {
  const getDataLoader = setupDataLoaderCache(db, {})
  const store = setupStore({ db, getDataLoader })

  // Ensure specifiedDate has been passed through in the correct format
  if (specifiedDate && !specifiedDate.match(dateRegex)) {
    throw new Error('Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23')
  }

  const { dateFilters, date } = formatDateByWeek(specifiedDate)

  // Fetches all the published jobs on nudj
  const publishedJobs = await store.readAll({
    type: 'jobs',
    filters: {
      status: jobStatusTypes.PUBLISHED
    }
  })

  // Fetches all the job views on nudj within the week
  const jobViews = await store.readAll({
    type: 'events',
    filters: {
      entityType: 'jobs',
      eventType: 'viewed',
      ...dateFilters
    }
  })

  const jobs = await Promise.all(publishedJobs.map(async job => {
    const views = filter(jobViews, { entityId: job.id })
    const viewCount = views ? views.length : 0

    const [
      referralCount,
      lifetimeReferralCount,
      applicationCount,
      lifetimeApplicationCount,
      lifetimeViewCount,
      company
    ] = await Promise.all([
      store.countByFilters({
        type: 'referrals',
        filters: {
          job: job.id,
          ...dateFilters
        }
      }),
      store.countByFilters({
        type: 'referrals',
        filters: {
          job: job.id,
          dateTo: dateFilters.dateTo
        }
      }),
      store.countByFilters({
        type: 'applications',
        filters: {
          job: job.id,
          ...dateFilters
        }
      }),
      store.countByFilters({
        type: 'applications',
        filters: {
          job: job.id,
          dateTo: dateFilters.dateTo
        }
      }),
      store.countByFilters({
        type: 'events',
        filters: {
          entityType: 'jobs',
          eventType: 'viewed',
          entityId: job.id,
          dateTo: dateFilters.dateTo
        }
      }),
      store.readOne({
        type: 'companies',
        id: job.company
      })
    ])

    return {
      company: company.name,
      title: job.title,
      'views': viewCount,
      'referral links': referralCount,
      'applications': applicationCount,
      'lifetime views': lifetimeViewCount,
      'lifetime referral links': lifetimeReferralCount,
      'lifetime applications': lifetimeApplicationCount
    }
  }))

  // Group jobs by company
  const jobsByCompany = groupBy(jobs, 'company')

  const clientCompanies = await fetchAll(db, 'companies', { client: true })

  // Fetch and format info on companies on nudj that do not currently have any published jobs
  const noPublishedJobsData = clientCompanies
    .filter(company => {
      // Check if the company is in the list of companies with published jobs
      return !(Object.keys(jobsByCompany).includes(company.name))
    })
    .map(company => [
      {
        company: company.name,
        title: totalTitle,
        'views': 0,
        'referral links': 0,
        'applications': 0,
        'lifetime views': 0,
        'lifetime referral links': 0,
        'lifetime applications': 0
      },
      blankRow
    ])

  // For each company, count their totals
  const jobData = Object.keys(jobsByCompany).map(company => {
    const jobs = jobsByCompany[company]
    if (!jobs.length) return [] // will be removed by flatten()

    return [
      ...jobs,
      {
        company,
        title: totalTitle, // Count totals per company
        'views': countTotal(jobs, 'views'),
        'referral links': countTotal(jobs, 'referral links'),
        'applications': countTotal(jobs, 'applications'),
        'lifetime views': countTotal(jobs, 'lifetime views'),
        'lifetime referral links': countTotal(jobs, 'lifetime referral links'),
        'lifetime applications': countTotal(jobs, 'lifetime applications')
      },
      blankRow
    ]
  })

  // Grab first job to add date at top of stats readout
  const [ firstJob, ...mainJobData ] = flatten(jobData)

  // Count the totals of every job
  const data = [
    {
      date: `Week starting ${date}`,
      ...firstJob
    },
    ...mainJobData,
    ...flatten(noPublishedJobsData),
    {
      company: 'Overall',
      title: totalTitle, // Count totals
      'views': countTotal(jobData, 'views'),
      'referral links': countTotal(jobData, 'referral links'),
      'applications': countTotal(jobData, 'applications'),
      'lifetime views': countTotal(jobData, 'lifetime views'),
      'lifetime referral links': countTotal(jobData, 'lifetime referral links'),
      'lifetime applications': countTotal(jobData, 'lifetime applications')
    }
  ]

  const csv = parseToCSV(data, {
    fields: [
      'date',
      'company',
      'title',
      'views',
      'referral links',
      'applications',
      '',
      'lifetime views',
      'lifetime referral links',
      'lifetime applications'
    ]
  })

  console.log(csv)
}

module.exports = action
