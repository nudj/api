async function up ({ db, step }) {
  await step('Convert Sources entities to DataSource enum items', async () => {
    const sourcesCollection = db.collection('sources')
    const sourcesAll = await sourcesCollection.all()
    const sourcesMap = await sourcesAll.reduce((sources, source) => Object.assign(sources, {
      [source._key]: source.name.toUpperCase()
    }), {})

    await Promise.all([
      'connections',
      'employments'
    ].map(async name => {
      const collection = db.collection(name)
      const all = await collection.all()
      await all.each(item => collection.update(item, {
        source: sourcesMap[item.source] || item.source
      }))
    }))
  })

  await step('Archive Sources collection', async () => {
    try {
      const collection = db.collection('sources')
      await collection.rename('sourcesArchive')
    } catch (error) {
      if (error.message !== `cannot rename collection: duplicate name`) {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Restore Sources collection', async () => {
    try {
      const collection = db.collection('sourcesArchive')
      await collection.rename('sources')
    } catch (error) {
      if (error.message !== `cannot rename collection: duplicate name`) {
        throw error
      }
    }
  })

  await step('Associate Connection.source\'s to Sources entities', async () => {
    const sourcesCollection = db.collection('sources')
    const sourcesAll = await sourcesCollection.all()
    const sourcesMap = await sourcesAll.reduce((sources, source) => Object.assign(sources, {
      [source.name.toUpperCase()]: source._key
    }), {})

    await Promise.all([
      'connections',
      'employments'
    ].map(async name => {
      const collection = db.collection(name)
      const all = await collection.all()
      await all.each(item => collection.update(item, {
        source: sourcesMap[item.source] || item.source
      }))
    }))
  })
}

module.exports = { up, down }
