const uniqBy = require('lodash/uniqBy')
const subDays = require('date-fns/sub_days')
const { parse: parseToCSV } = require('json2csv')

const { store: setupStore } = require('../../gql/adaptors/arango')
const setupDataLoaderCache = require('../../gql/lib/setup-dataloader-cache')
const { startOfDay, endOfDay } = require('../../gql/lib/format-dates')

// Checks for format of date eg., 2000-01-01
const dateRegex = /([0-9]){4}-([0-9]){2}-([0-9]){2}/

async function action ({ db, arg: specifiedDate }) {
  const getDataLoader = setupDataLoaderCache(db, {})
  const store = setupStore({ db, getDataLoader })

  // Ensure specifiedDate has been passed through in the correct format
  if (specifiedDate && !specifiedDate.match(dateRegex)) {
    throw new Error('Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23')
  }

  const timestamp = specifiedDate || subDays(new Date(), 1).toISOString() // yesterday
  const dateFilters = {
    dateFrom: startOfDay(timestamp),
    dateTo: endOfDay(timestamp)
  }

  const [
    companiesCount,
    jobsCount,
    applicationsCount,
    referralsCount,
    surveyAnswers
  ] = await Promise.all([
    store.countByFilters({
      type: 'companies',
      filters: {
        ...dateFilters,
        client: true
      }
    }),
    store.countByFilters({
      type: 'jobs',
      filters: dateFilters
    }),
    store.countByFilters({
      type: 'applications',
      filters: dateFilters
    }),
    store.countByFilters({
      type: 'referrals',
      filters: dateFilters
    }),
    store.readAll({
      type: 'surveyAnswers',
      filters: dateFilters
    })
  ])
  const surveyAnswersByPersonCount = uniqBy(surveyAnswers, 'person').length

  const data = {
    'New companies': companiesCount,
    'New jobs': jobsCount,
    'New applications': applicationsCount,
    'New referrals': referralsCount,
    'Surveys started': surveyAnswersByPersonCount
  }

  const csv = parseToCSV(data, {
    fields: [
      'New companies',
      'New jobs',
      'New applications',
      'New referrals',
      'Surveys started',
      'Demos booked', // manual addition
      'Applicants hired' // manual addition
    ]
  })

  console.log(csv)
}

module.exports = action
