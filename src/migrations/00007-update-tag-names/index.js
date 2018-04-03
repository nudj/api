const snakeCase = require('lodash/snakeCase')
const camelCase = require('lodash/camelCase')

async function up ({ db, step }) {
  await step('Update tag names to new format', async () => {
    const collection = db.collection('tags')
    const allCursor = await collection.all()
    const allResults = await allCursor.all()

    const updatedTags = allResults.map(tag => collection.update(tag, {
      name: snakeCase(tag.name).toUpperCase()
    }))

    return Promise.all(updatedTags)
  })
}

async function down ({ db, step }) {
  await step('Revert tag names to old format', async () => {
    const collection = db.collection('tags')
    const allCursor = await collection.all()
    const allResults = await allCursor.all()

    const updatedTags = allResults.map(tag => collection.update(tag, {
      name: camelCase(tag.name)
    }))

    return Promise.all(updatedTags)
  })
}

module.exports = { up, down }
