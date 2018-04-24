const find = require('lodash/find')

const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/lib/constants')

const makeSlug = require('../../gql/lib/helpers/make-slug')
const { fetchAll } = require('../../lib')
const { values: dataSources } = require('../../gql/schema/enums/data-sources')

async function up ({ db, step }) {
  await step('Add `current` flag set as `false` to employments', async () => {
    const collection = db.collection('employments')
    const employments = await fetchAll(db, 'employments')

    await Promise.all(
      employments.map(employment => collection.update(employment, {
        current: false
      }))
    )
  })

  await step('Convert `Person.company` to a current `employment` entity', async () => {
    const employmentsCollection = db.collection('employments')
    const companiesCollection = db.collection('companies')
    const hirersCollection = db.collection('hirers')
    const peopleCollection = db.collection('people')

    const people = await fetchAll(db, 'people')

    await Promise.all(people.map(async person => {
      if (!person.company) return

      let company
      try {
        const hirer = await hirersCollection.firstExample({ person: person._key })
        company = { _key: hirer.company }
      } catch (error) {
        if (error.message !== 'no match') throw error
      }

      if (!company) {
        try {
          company = await companiesCollection.firstExample({ name: person.company })
        } catch (error) {
          if (error.message !== 'no match') throw error
          company = await companiesCollection.save({
            _key: generateId(idTypes.COMPANY, { name: person.company }),
            name: person.company,
            slug: makeSlug(person.company),
            onboarded: false,
            client: false
          })
        }
      }

      await employmentsCollection.save({
        _key: generateId(),
        company: company._key,
        person: person._key,
        source: dataSources.NUDJ,
        current: true
      })

      await peopleCollection.update(person, {
        company: null
      }, { keepNull: false })
    }))
  })
}

async function down ({ db, step }) {
  await step('Reconvert current `employment` entities to `Person.company`', async () => {
    const companiesCollection = db.collection('companies')
    const employmentsCollection = db.collection('employments')
    const peopleCollection = db.collection('people')

    const employments = await fetchAll(db, 'employments')
    const people = await fetchAll(db, 'people')

    await Promise.all(people.map(async person => {
      const currentEmployment = find(employments, {
        current: true,
        person: person._key
      })

      if (currentEmployment) {
        const company = await companiesCollection.firstExample({
          _key: currentEmployment.company
        })

        await peopleCollection.update(person, {
          company: company.name
        })
        await employmentsCollection.remove(currentEmployment._key)
      }
    }))
  })

  await step('Remove `current` flag from employment entities', async () => {
    const collection = db.collection('employments')
    const employments = await fetchAll(db, 'employments')

    await Promise.all(
      employments.map(employment => collection.update(employment, {
        current: null
      }, { keepNull: false }))
    )
  })
}

module.exports = { up, down }
