const promiseSerial = require('promise-serial')

const { fetchAll } = require('../../lib')

async function up ({ db, step }) {
  await step('Remove empty and leftover fields on `Person` entities', async () => {
    const peopleCollection = db.collection('people')
    const people = await fetchAll(db, 'people')

    const removeField = (entity, field) => {
      return peopleCollection.update(entity, {
        [field]: null
      }, { keepNull: false })
    }

    await promiseSerial(people.map(person => async () => {
      const { company, type, status, title } = person

      if (company === '') await removeField(person, 'company')
      if (type === '') await removeField(person, 'type')
      if (status === '') await removeField(person, 'status')
      if (title === '') await removeField(person, 'title')

      return person
    }))
  })
}

async function down ({ db, step }) {
  // No-op to make migration error-resilient
}

module.exports = { up, down }
