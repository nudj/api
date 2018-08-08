const { DUMMY_APPLICANT_EMAIL_ADDRESS } = require('../../gql/lib/constants')

const newISODate = () => (new Date()).toISOString()

async function up ({ db, step }) {
  await step('Add dummy person for mock data', async () => {
    const peopleCollection = db.collection('people')
    await peopleCollection.save({
      firstName: 'Buzz',
      lastName: 'Lightyear',
      email: DUMMY_APPLICANT_EMAIL_ADDRESS,
      url: 'https://pixar.wikia.com/wiki/Buzz_Lightyear',
      created: newISODate(),
      modified: newISODate()
    })
  })
}

async function down ({ db, step }) {
  await step('Remove dummy person mock data', async () => {
    const peopleCollection = db.collection('people')
    const cursor = await peopleCollection.byExample({
      email: DUMMY_APPLICANT_EMAIL_ADDRESS
    })
    const dummyPerson = await cursor.next()

    if (dummyPerson) await peopleCollection.remove(dummyPerson._key)
  })
}

module.exports = { up, down }
