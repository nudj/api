/* eslint-env mocha */
const orderBy = require('lodash/orderBy')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')
const setupDataLoaderCache = require('../../../gql/lib/setup-dataloader-cache')

const primaryCollectionName = 'people'
const secondaryCollectionName = 'pets'

describe('import', () => {
  let store
  before(async () => {
    await setupCollections(db, [primaryCollectionName, secondaryCollectionName])
  })

  beforeEach(async () => {
    store = Store({
      db,
      getDataLoader: setupDataLoaderCache(db, {})
    })
  })

  after(async () => {
    await teardownCollections(db, [primaryCollectionName, secondaryCollectionName])
  })

  afterEach(async () => {
    await truncateCollections(db, [primaryCollectionName, secondaryCollectionName])
  })

  it('adds data to the specified collection', async () => {
    const peopleCollection = await db.collection(primaryCollectionName).all()
    expect(peopleCollection.count).to.equal(0)

    const newPeopleData = [
      {
        name: primaryCollectionName,
        data: [
          {
            name: 'Dave'
          },
          {
            name: 'Phil'
          },
          {
            name: 'Goddard'
          }
        ]
      }
    ]

    await store.import({
      data: newPeopleData
    })
    const updatedPeopleCollection = await db.collection(primaryCollectionName).all()
    const results = orderBy(await updatedPeopleCollection.all(), ['name'])
    expect(results.length).to.equal(3)
    expect(results[0]).to.have.property('name').to.equal('Dave')
    expect(results[1]).to.have.property('name').to.equal('Goddard')
    expect(results[2]).to.have.property('name').to.equal('Phil')
  })

  it('adds data to multiple collections', async () => {
    const peopleCollection = await db.collection(primaryCollectionName).all()
    const petsCollection = await db.collection(secondaryCollectionName).all()
    expect(peopleCollection.count).to.equal(0)
    expect(petsCollection.count).to.equal(0)

    const uploadedData = [
      {
        name: primaryCollectionName,
        data: [
          {
            name: 'Charli'
          },
          {
            name: 'Gary'
          },
          {
            name: 'James'
          }
        ]
      },
      {
        name: secondaryCollectionName,
        data: [
          {
            name: 'Fluffy',
            species: 'cat'
          },
          {
            name: 'Patches',
            species: 'dog'
          },
          {
            name: 'Larry',
            species: 'Iguana'
          },
          {
            name: 'Fidget',
            species: 'Elephant'
          }
        ]
      }
    ]

    await store.import({
      data: uploadedData
    })
    const updatedPeopleCollection = await db.collection(primaryCollectionName).all()
    const updatedPetsCollection = await db.collection(secondaryCollectionName).all()
    const peopleResults = orderBy(await updatedPeopleCollection.all(), ['name'])
    const petResults = orderBy(await updatedPetsCollection.all(), ['name'])

    expect(peopleResults.length).to.equal(3)
    expect(peopleResults[0]).to.have.property('name').to.equal('Charli')
    expect(peopleResults[1]).to.have.property('name').to.equal('Gary')
    expect(peopleResults[2]).to.have.property('name').to.equal('James')

    expect(petResults.length).to.equal(4)
    expect(petResults[0]).to.have.property('name').to.equal('Fidget')
    expect(petResults[1]).to.have.property('name').to.equal('Fluffy')
    expect(petResults[2]).to.have.property('name').to.equal('Larry')
    expect(petResults[3]).to.have.property('name').to.equal('Patches')
  })

  it('maintains pre-specified ID values', async () => {
    const peopleCollection = await db.collection(primaryCollectionName).all()
    expect(peopleCollection.count).to.equal(0)

    const newPeopleData = [
      {
        name: primaryCollectionName,
        data: [
          {
            id: 'DaveID',
            name: 'Dave'
          },
          {
            id: 'SPECIAL_ID',
            name: 'Phil'
          },
          {
            id: 'GODDARD_FTW',
            name: 'Goddard'
          }
        ]
      }
    ]

    await store.import({
      data: newPeopleData
    })
    const updatedPeopleCollection = await db.collection(primaryCollectionName).all()
    const results = orderBy(await updatedPeopleCollection.all(), ['name'])
    expect(results.length).to.equal(3)
    expect(results[0]).to.have.property('name').to.equal('Dave')
    expect(results[0]).to.have.property('_key').to.equal('DaveID')
    expect(results[1]).to.have.property('name').to.equal('Goddard')
    expect(results[1]).to.have.property('_key').to.equal('GODDARD_FTW')
    expect(results[2]).to.have.property('name').to.equal('Phil')
    expect(results[2]).to.have.property('_key').to.equal('SPECIAL_ID')
  })

  it('ignores duplicate values by default', async () => {
    const customId = 'O_O'
    await db.collection(primaryCollectionName).save({
      _key: customId,
      name: 'Dave'
    })

    const newPeopleData = [
      {
        name: primaryCollectionName,
        data: [
          {
            id: customId,
            name: 'Dave',
            age: 23
          }
        ]
      }
    ]

    await store.import({
      data: newPeopleData
    })

    const updatedPeopleCollection = await db.collection(primaryCollectionName).all()
    const results = orderBy(await updatedPeopleCollection.all(), ['name'])
    expect(results.length).to.equal(1)
    expect(results[0]).to.have.property('name').to.equal('Dave')
    expect(results[0]).to.not.have.property('age')
  })

  it('updates duplicate values if specified', async () => {
    const customId = 'O_O'
    await db.collection(primaryCollectionName).save({
      _key: customId,
      name: 'Dave'
    })

    const newPeopleData = [
      {
        name: primaryCollectionName,
        onDuplicate: 'update',
        data: [
          {
            id: customId,
            name: 'Dave',
            age: 23
          }
        ]
      }
    ]

    await store.import({
      data: newPeopleData
    })

    const updatedPeopleCollection = await db.collection(primaryCollectionName).all()
    const results = orderBy(await updatedPeopleCollection.all(), ['name'])
    expect(results.length).to.equal(1)
    expect(results[0]).to.have.property('name').to.equal('Dave')
    expect(results[0]).to.have.property('age').to.equal(23)
  })

  it('returns result statistics of data import', async () => {
    const uploadedData = [
      {
        name: primaryCollectionName,
        data: [
          {
            name: 'Charli'
          },
          {
            name: 'Gary'
          },
          {
            name: 'James'
          }
        ]
      },
      {
        name: secondaryCollectionName,
        data: [
          {
            name: 'Fluffy',
            species: 'cat'
          },
          {
            name: 'Patches',
            species: 'dog'
          },
          {
            name: 'Larry',
            species: 'Iguana'
          },
          {
            name: 'Fidget',
            species: 'Elephant'
          }
        ]
      }
    ]

    const importData = await store.import({
      data: uploadedData
    })

    expect(importData).to.deep.equal([
      {
        collection: 'people',
        error: false,
        details: [],
        created: 3,
        empty: 0,
        errors: 0,
        ignored: 0,
        updated: 0
      },
      {
        collection: 'pets',
        error: false,
        details: [],
        created: 4,
        empty: 0,
        errors: 0,
        ignored: 0,
        updated: 0
      }
    ])
  })

  it('throws if import encounters an error', async () => {
    const customId = 'O_O'
    await db.collection(primaryCollectionName).save({
      _key: customId,
      name: 'Dave'
    })

    const data = [
      {
        name: primaryCollectionName,
        onDuplicate: 'error',
        data: [
          {
            id: customId,
            name: 'Dave',
            age: 23
          }
        ]
      }
    ]

    return store.import({ data })
      .catch(error => {
        expect(error.message).to.contain(
          'Import Error: at position 0: creating document failed with error \'unique constraint violated\''
        )
      })
  })
})
