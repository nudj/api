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

async function up ({ db, step }) {
  await step('Add `signedUp` boolean `true` to hirers and referrers', async () => {
    // The logic here is that in order to be a hirer or refer,
    // you'll have needed to sign up
    const people = await fetchAll(db, 'people')

    await Promise.all(people.map(async person => {
      const hirer = await fetchByExample(db, 'hirers', { person: person._key })
      const referral = await fetchByExample(db, 'referrals', { person: person._key })

      if (hirer || referral) {
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
