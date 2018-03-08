async function up ({ db, step }) {
  await step('Set Company.client boolean to false for all companies', async () => {
    const companiesCollection = db.collection('companies')
    const allCompanies = await companiesCollection.all()
    await allCompanies.each(company => companiesCollection.update(company, { client: false }))
  })

  await step('Set Hirer.onboarded boolean to all hirers', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirersCursor = await hirersCollection.all()
    await allHirersCursor.each(hirer => hirersCollection.update(hirer, { onboarded: false }))
  })

  await step('Truncate surveys collection', async () => {
    const surveysCollection = db.collection('surveys')
    await surveysCollection.truncate()
  })

  await step('Create missing collections', async () => {
    await Promise.all([
      'surveySections',
      'surveyQuestions',
      'surveyAnswers',
      'connections',
      'roles',
      'sources',
      'employments'
    ].map(async name => {
      try {
        const collection = db.collection(name)
        await collection.create()
      } catch (error) {
        if (error.message !== 'duplicate name: duplicate name') {
          throw error
        }
      }
    }))
  })

  await step('Truncate accounts collection', async () => {
    const accountsCollection = db.collection('accounts')
    await accountsCollection.truncate()
  })

  await step('Update conversations format', async () => {
    const hirersCollection = db.collection('hirers')
    const conversationsCollection = db.collection('conversations')
    const allConversations = await conversationsCollection.all()
    await allConversations.each(async conversation => {
      if (conversation.person) return
      let person

      try {
        const hirer = await hirersCollection.document(conversation.hirer)
        person = hirer.person
      } catch (error) {
        // some conversation.hirer values are person ids ¯\_(ツ)_/¯
        person = conversation.hirer
      }

      return conversationsCollection.update(conversation, {
        person,
        hirer: null,
        type: 'GOOGLE',
        job: null,
        provider: null,
        data: null,
        threadId: conversation.threadId || conversation.data.threadId
      }, { keepNull: false })
    })
  })

  await step('Remove ids from arango data', async () => {
    // Due to a bug any updates to records performed in the admin tool were
    // not removing the id from the data before patching. This should have been
    // harmless but it allowed us to filter by id which does not strictly work
    // for freshly added records. Essentially there is inconsistent data which
    // must be resolved.

    const collectionRemoveId = collection => record => collection.update(record, { id: null }, { keepNull: false })
    const collectionNames = [
      'companies',
      'jobs',
      'people',
      'surveys'
    ]

    await Promise.all(collectionNames.map(async collectionName => {
      const collection = db.collection(collectionName)
      const cursor = await collection.all()
      await cursor.each(collectionRemoveId(collection))
    }))
  })

  await step('Archive conversations and create new conversations collection', async () => {
    try {
      const oldConversationsCollection = db.collection('conversations')
      await oldConversationsCollection.rename('conversationsArchive')
    } catch (error) {
      if (error.message !== `cannot rename collection: duplicate name`) {
        throw error
      }
    }
    try {
      const newConversationsCollection = db.collection('conversations')
      await newConversationsCollection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })
}

async function down ({ db, step }) {
  await step('Remove Company.client boolean from all companies', async () => {
    const companiesCollection = db.collection('companies')
    const allCompanies = await companiesCollection.all()
    await allCompanies.each(company => companiesCollection.update(company, { client: null }, { keepNull: false }))
  })

  await step('Remove Hirer.onboarded boolean from all hirers', async () => {
    const hirersCollection = db.collection('hirers')
    const allHirersCursor = await hirersCollection.all()
    await allHirersCursor.each(hirer => hirersCollection.update(hirer, { onboarded: null }, { keepNull: false }))
  })

  await step('Truncating surveys collection', async () => {
    // cannot undo as is destructive so will just remove everything ready for a fresh import
    const surveysCollection = db.collection('surveys')
    await surveysCollection.truncate()
  })

  await step('Remove added collections', async () => {
    await Promise.all([
      'surveySections',
      'surveyQuestions',
      'surveyAnswers',
      'connections',
      'roles',
      'sources'
    ].map(async name => {
      try {
        const collection = db.collection(name)
        await collection.drop()
      } catch (error) {
        if (error.message !== `unknown collection '${name}'`) {
          throw error
        }
      }
    }))
  })

  await step('Truncate accounts collection', async () => {
    // cannot undo as is destructive so will just remove everything ready for a fresh import
    const accountsCollection = db.collection('accounts')
    await accountsCollection.truncate()
  })

  await step('Revert conversations format', async () => {
    const hirersCollection = db.collection('hirers')
    const conversationsCollection = db.collection('conversations')
    const allConversations = await conversationsCollection.all()
    await allConversations.each(async conversation => {
      if (conversation.hirer) return
      const hirerRecord = await hirersCollection.firstExample({ person: conversation.person })
      const hirer = hirerRecord._key
      return conversationsCollection.update(conversation, {
        hirer,
        person: null,
        provider: 'GMAIL',
        type: null
      }, { keepNull: false })
    })
  })

  await step('Not restoring any data ids', async () => {
    // there is no required reverse migration
  })

  await step('Archive conversations and create new conversations collection', async () => {
    try {
      const newConversationsCollection = db.collection('conversations')
      await newConversationsCollection.drop()
    } catch (error) {
      if (error.message !== `unknown collection 'conversations'`) {
        throw error
      }
    }
    try {
      const oldConversationsCollection = db.collection('conversationsArchive')
      await oldConversationsCollection.rename('conversations')
    } catch (error) {
      if (error.message !== `cannot rename collection: duplicate name`) {
        throw error
      }
    }
  })
}

module.exports = { up, down }
