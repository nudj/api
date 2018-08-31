const filter = require('lodash/filter')
const flatten = require('lodash/flatten')
const groupBy = require('lodash/groupBy')
const subDays = require('date-fns/sub_days')
const { parse: parseToCSV } = require('json2csv')

const { store: setupStore } = require('../../gql/adaptors/arango')
const setupDataLoaderCache = require('../../gql/lib/setup-dataloader-cache')
const { startOfDay, endOfDay } = require('../../gql/lib/format-dates')
const { values: jobStatusTypes } = require('../../gql/schema/enums/job-status-types')

// Checks for format of date eg., 2000-01-01
const dateRegex = /([0-9]){4}-([0-9]){2}-([0-9]){2}/

const countTotal = (data, key) => flatten(data)
  .map(datum => datum[key])
  .reduce((a, b) => a + b, 0)

async function action ({ db, arg: specifiedDate }) {
  const getDataLoader = setupDataLoaderCache(db, {})
  const store = setupStore({ db, getDataLoader })

  // Ensure specifiedDate has been passed through in the correct format
  if (specifiedDate && !specifiedDate.match(dateRegex)) {
    throw new Error('Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23')
  }

  const timestamp = specifiedDate || subDays(new Date(), 1).toISOString() // yesterday
  const date = timestamp.slice(0, 10)
  const dateFilters = {
    dateFrom: startOfDay(timestamp),
    dateTo: endOfDay(timestamp)
  }

  const publishedJobs = await store.readAll({
    type: 'jobs',
    filters: {
      status: jobStatusTypes.PUBLISHED
    }
  })

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

    const referralCount = await store.countByFilters({
      type: 'referrals',
      filters: {
        job: job.id,
        ...dateFilters
      }
    })
    const company = await store.readOne({
      type: 'companies',
      id: job.company
    })

    return {
      date,
      company: company.name,
      title: job.title,
      'view count': viewCount,
      'referral count': referralCount
    }
  }))

  // Group jobs by company
  const jobsByCompany = groupBy(jobs, 'company')

  // For each company, count their totals
  const jobData = Object.keys(jobsByCompany).map(companyName => {
    const jobs = jobsByCompany[companyName]
    if (!jobs.length) return [] // will be removed by flatten()
    const { company, date } = jobs[0]

    return [
      ...jobs,
      {
        date,
        company,
        title: 'Total', // Count totals per company
        'view count': countTotal(jobs, 'view count'),
        'referral count': countTotal(jobs, 'referral count')
      }
    ]
  })

  // Count the totals of every job
  const data = [
    ...flatten(jobData),
    {
      date,
      company: 'Overall',
      title: 'Total', // Count totals
      'view count': countTotal(jobData, 'view count'),
      'referral count': countTotal(jobData, 'referral count')
    }
  ]

  const csv = parseToCSV(data, {
    fields: [
      'date',
      'company',
      'title',
      'view count',
      'referral count'
    ]
  })

  console.log(csv)
}

module.exports = action
