/* eslint-env mocha */
const sortBy = require('lodash/sortBy')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../gql/adaptors/arango/store')

const tvSeriesCollection = 'tvSeries'
const studiosCollection = 'studios'
const countriesCollection = 'countries'

const resetDataStore = async () => populateCollections(db, [
  {
    collection: tvSeriesCollection,
    data: [
      {
        name: 'The Walking Dead',
        domain: 'country1',
        ratings: 'high',
        studio: 'company1',
        genre: 'action',
        statistics: {
          budget: '$10,000,000',
          views: {
            averageEpisode: '1000',
            total: '1,000,000'
          }
        }
      },
      {
        name: 'West Wing',
        domain: 'country2',
        ratings: 'high',
        studio: 'company2',
        genre: 'drama',
        statistics: {
          budget: '$1,000,000',
          views: {
            averageEpisode: '1500',
            total: '1,500,000'
          }
        }
      },
      {
        name: 'Takeshi\'s Castle',
        domain: 'country2',
        ratings: 'average',
        studio: 'company2',
        genre: 'gameshow',
        statistics: {
          budget: '$500,000',
          views: {
            averageEpisode: '410',
            total: '50,000'
          }
        }
      },
      {
        name: 'Black Mirror',
        domain: 'country2',
        ratings: 'average',
        studio: 'company2',
        genre: 'sci-fi horror',
        statistics: {
          budget: '$1,500,000',
          views: {
            averageEpisode: '900',
            total: '500,000'
          }
        }
      },
      {
        name: 'Land of the Dead',
        domain: 'country3',
        ratings: 'low',
        studio: 'company3',
        genre: 'action',
        statistics: {
          budget: '$100,000',
          views: {
            averageEpisode: '435',
            total: '4,000'
          }
        }
      },
      {
        name: 'Drake',
        domain: 'country1',
        ratings: 'low',
        studio: 'company1',
        genre: 'drama',
        statistics: {
          budget: '$80,000',
          views: {
            averageEpisode: '30',
            total: '200'
          }
        }
      },
      {
        name: 'Dead Island',
        domain: 'country1',
        ratings: 'average',
        studio: 'company1',
        genre: 'horror',
        statistics: {
          budget: '$1,300,000',
          views: {
            averageEpisode: '100',
            total: '1,000'
          }
        }
      },
      {
        name: 'Waking Ned',
        domain: 'country1',
        ratings: 'average',
        studio: 'company1',
        genre: 'drama',
        statistics: {
          budget: '$1,000,000',
          views: {
            averageEpisode: '450',
            total: '455,000'
          }
        }
      },
      {
        name: 'End Game',
        domain: 'country2',
        ratings: 'high',
        studio: 'company2',
        genre: 'thriller',
        statistics: {
          budget: '$500,000',
          views: {
            averageEpisode: '30',
            total: '3,000'
          }
        }
      }
    ]
  },
  {
    collection: studiosCollection,
    data: [
      {
        _key: 'company1',
        country: 'country1',
        name: 'Times Station'
      },
      {
        _key: 'company2',
        country: 'country2',
        name: 'Lone Star TV'
      },
      {
        _key: 'company3',
        country: 'country3',
        name: 'Whitehall Studios'
      }
    ]
  },
  {
    collection: countriesCollection,
    data: [
      {
        _key: 'country1',
        name: 'UK'
      },
      {
        _key: 'country2',
        name: 'USA'
      },
      {
        _key: 'country3',
        name: 'Canada'
      }
    ]
  }
])

describe('search', () => {
  let store
  before(async () => {
    await setupCollections(db, [tvSeriesCollection, studiosCollection, countriesCollection])
  })

  beforeEach(async () => {
    await resetDataStore()
    store = Store({ db })
  })

  after(async () => {
    await teardownCollections(db, [tvSeriesCollection, studiosCollection, countriesCollection])
  })

  afterEach(async () => {
    await truncateCollections(db, [tvSeriesCollection, studiosCollection, countriesCollection])
  })

  it('returns the results in order of most matches', async () => {
    const response = await store.search({
      type: tvSeriesCollection,
      query: 'Dra',
      fields: [
        ['name'],
        ['genre']
      ]
    })
    expect(response.length).to.equal(3)
    expect(response[0]).to.have.property('name').to.equal('Drake')
  })

  it('returns the filtered results in order of most matches', async () => {
    const response = await store.search({
      type: tvSeriesCollection,
      query: 'Dra',
      fields: [
        ['name'],
        ['genre']
      ],
      filters: {
        genre: 'drama'
      }
    })
    expect(response.length).to.equal(3)
    expect(response[0]).to.have.property('name').to.equal('Drake')
  })

  describe('with single field', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Wa',
        fields: [
          ['name']
        ]
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(2)
      expect(results[0]).to.have.property('name').to.equal('The Walking Dead')
      expect(results[1]).to.have.property('name').to.equal('Waking Ned')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Wa',
        fields: [
          ['name']
        ],
        filters: {
          ratings: 'high'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('The Walking Dead')
    })
  })

  describe('with multiple fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Dra',
        fields: [
          ['name'],
          ['genre']
        ],
        filters: {
          ratings: 'low'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Drake')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'game',
        fields: [
          ['name'],
          ['genre']
        ],
        filters: {
          ratings: 'average'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Takeshi\'s Castle')
    })
  })

  describe('with combined fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'land horror',
        fields: [
          ['name', 'genre']
        ]
      })
      expect(response.length).to.equal(3)
      expect(response[0]).to.have.property('name').to.equal('Dead Island')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'dead action',
        fields: [
          ['name', 'genre']
        ],
        filters: {
          ratings: 'low'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Land of the Dead')
    })
  })

  describe('with nested fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: '$1,000,000',
        fields: [
          ['statistics.budget']
        ]
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(2)
      expect(results[0]).to.have.property('name').to.equal('Waking Ned')
      expect(results[1]).to.have.property('name').to.equal('West Wing')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: '$1,000,000',
        fields: [
          ['statistics.budget']
        ],
        filters: {
          ratings: 'high'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('West Wing')
    })
  })

  describe('with deeply nested fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: '30',
        fields: [
          ['statistics.views.averageEpisode']
        ]
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(2)
      expect(results[0]).to.have.property('name').to.equal('Drake')
      expect(results[1]).to.have.property('name').to.equal('End Game')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: '30',
        fields: [
          ['statistics.views.averageEpisode']
        ],
        filters: {
          genre: 'thriller'
        }
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(1)
      expect(results[0]).to.have.property('name').to.equal('End Game')
    })
  })

  describe('with nested collection fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Lone Star',
        fields: [
          ['studio.name']
        ]
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(4)
      expect(results[0]).to.have.property('name').to.equal('Black Mirror')
      expect(results[1]).to.have.property('name').to.equal('End Game')
      expect(results[2]).to.have.property('name').to.equal('Takeshi\'s Castle')
      expect(results[3]).to.have.property('name').to.equal('West Wing')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Lone Star',
        fields: [
          ['studio.name']
        ],
        filters: {
          ratings: 'average',
          genre: 'sci-fi horror'
        }
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Black Mirror')
    })
  })

  describe('with deeply nested collection fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Canada',
        fields: [
          ['studio.country.name']
        ]
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Land of the Dead')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'USA',
        fields: [
          ['studio.country.name']
        ],
        filters: {
          ratings: 'high'
        }
      })
      const results = sortBy(response, ['name'])
      expect(results.length).to.equal(2)
      expect(results[0]).to.have.property('name').to.equal('End Game')
      expect(results[1]).to.have.property('name').to.equal('West Wing')
    })
  })

  describe('with aliased fields', () => {
    it('returns normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Canada',
        fields: [
          ['domain.name']
        ],
        fieldAliases: [
          { domain: 'country' }
        ]
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Land of the Dead')
    })

    it('returns filtered and normalised results', async () => {
      const response = await store.search({
        type: tvSeriesCollection,
        query: 'Canada',
        filters: {
          ratings: 'low'
        },
        fields: [
          ['domain.name']
        ],
        fieldAliases: [
          { domain: 'country' }
        ]
      })
      expect(response.length).to.equal(1)
      expect(response[0]).to.have.property('name').to.equal('Land of the Dead')
    })
  })
})
