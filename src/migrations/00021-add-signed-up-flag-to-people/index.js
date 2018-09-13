const { fetchAll } = require('../../lib')

const fetchByExample = async (db, type, filters) => {
  let result
  try {
    result = await db.collection(type).firstExample(filters)
  } catch (error) {
    if (error.message !== 'no match') throw error
  }

  return result
}

const fetchOldApplicationsForPerson = async (db, person) => {
  // This is the date that Auth0 was removed from the application flow
  // Any applications made prior to this date would have required a signup
  const date = '2018-08-16T00:00:00.000+00:00'
  const aqlQuery = `
    FOR application IN applications
      FILTER application.person == @person
      FILTER DATE_TIMESTAMP(application.created) <= DATE_TIMESTAMP(@date)
      RETURN application
  `

  const cursor = await db.query(aqlQuery, { date, person })
  const response = await cursor.all()
  return response
}

async function up ({ db, step }) {
  await step('Add `signedUp` boolean `true` to hirers and referrers', async () => {
    // The logic here is that in order to be a hirer or refer,
    // you'll have needed to sign up
    const people = await fetchAll(db, 'people')

    await Promise.all(people.map(async person => {
      const hirer = await fetchByExample(db, 'hirers', { person: person._key })
      const referral = await fetchByExample(db, 'referrals', { person: person._key })
      const oldApplications = await fetchOldApplicationsForPerson(db, person._key)

      if (hirer || referral || oldApplications.length) {
        await db.collection('people').update(person._key, {
          signedUp: true
        })
      }
    }))
  })
}

async function down ({ db, step }) {
  const people = await fetchAll(db, 'people')

  await Promise.all(people.map(async person => {
    return db.collection('people').update(person._key, {
      signedUp: null
    }, { keepNull: false })
  }))
}

module.exports = { up, down }
