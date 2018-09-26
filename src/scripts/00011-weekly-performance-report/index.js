const uniqBy = require('lodash/uniqBy')
const subDays = require('date-fns/sub_days')
const startOfWeek = require('date-fns/start_of_week')
const endOfWeek = require('date-fns/end_of_week')
const { parse: parseToCSV } = require('json2csv')

const { store: setupStore } = require('../../gql/adaptors/mysql')
const { startOfDay, endOfDay } = require('../../gql/lib/format-dates')

// Checks for format of date eg., 2000-01-01
const dateRegex = /([0-9]){4}-([0-9]){2}-([0-9]){2}/

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
  const store = setupStore({ db })

  // Ensure specifiedDate has been passed through in the correct format
  if (specifiedDate && !specifiedDate.match(dateRegex)) {
    throw new Error('Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23')
  }

  const { date, dateFilters } = formatDateByWeek(specifiedDate)

  const [
    companiesCount,
    jobsCount,
    applicationsCount,
    referralsCount,
    surveyAnswers
  ] = await Promise.all([
    store.count({
      type: 'companies',
      filters: {
        ...dateFilters,
        client: true
      }
    }),
    store.count({
      type: 'jobs',
      filters: dateFilters
    }),
    store.count({
      type: 'applications',
      filters: dateFilters
    }),
    store.count({
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
    'Date': `Week starting ${date}`,
    'New companies': companiesCount,
    'New jobs': jobsCount,
    'New applications': applicationsCount,
    'New referrals': referralsCount,
    'Surveys started': surveyAnswersByPersonCount
  }

  const csv = parseToCSV(data, {
    fields: [
      'Date',
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
