/* eslint-env mocha */
const chai = require('chai')
const uniqBy = require('lodash/uniqBy')
const expect = chai.expect

const { generateFakeContextWithStore } = require('../../helpers')
const fetchConnectionPropertyMap = require('../../../gql/lib/helpers/fetch-connection-property-map')

const db = {
  connections: [{
    id: 'connection1',
    role: 'role1',
    company: 'company1',
    person: 'person1',
    source: 'source1'
  }, {
    id: 'connection2',
    role: 'role2',
    company: 'company2',
    person: 'person2',
    source: 'source2'
  }, {
    id: 'connection2',
    role: 'role1',
    company: 'company1',
    person: 'person4',
    source: 'source1'
  }, {
    id: 'connection4',
    role: null,
    company: null,
    person: 'person3',
    source: 'source1'
  }],
  roles: [{
    id: 'role1'
  }, {
    id: 'role2'
  }, {
    id: 'role3'
  }],
  companies: [{
    id: 'company1'
  }, {
    id: 'company2'
  }, {
    id: 'company3'
  }],
  people: [{
    id: 'person1'
  }, {
    id: 'person2'
  }, {
    id: 'person3'
  }, {
    id: 'person4'
  }],
  sources: [{
    id: 'source1'
  }, {
    id: 'source2'
  }, {
    id: 'source3'
  }]
}

const store = {
  readMany: async ({ type, ids }) => {
    return uniqBy(
      db[type].filter(item => ids.indexOf(item.id) > -1)
    )
  }
}
const context = generateFakeContextWithStore(store)

describe('fetchConnectionPropertyMap', () => {
  describe('for the given connections', () => {
    it('should fetch a map of roles', async () => {
      const { roleMap } = await fetchConnectionPropertyMap(
        context,
        [{
          id: 'connection1',
          role: 'role1',
          company: 'company1',
          person: 'person1',
          source: 'source1'
        }, {
          id: 'connection2',
          role: 'role2',
          company: 'company2',
          person: 'person2',
          source: 'source2'
        }, {
          id: 'connection2',
          role: 'role1',
          company: 'company1',
          person: 'person4',
          source: 'source1'
        }]
      )

      expect(roleMap).to.deep.equal({
        role1: {
          id: 'role1'
        },
        role2: {
          id: 'role2'
        }
      })
    })

    it('should fetch a map of companies', async () => {
      const { companyMap } = await fetchConnectionPropertyMap(
        context,
        [{
          id: 'connection1',
          role: 'role1',
          company: 'company1',
          person: 'person1',
          source: 'source1'
        }, {
          id: 'connection2',
          role: 'role2',
          company: 'company2',
          person: 'person2',
          source: 'source2'
        }, {
          id: 'connection2',
          role: 'role1',
          company: 'company1',
          person: 'person4',
          source: 'source1'
        }]
      )

      expect(companyMap).to.deep.equal({
        company1: {
          id: 'company1'
        },
        company2: {
          id: 'company2'
        }
      })
    })

    it('should fetch a map of people', async () => {
      const { personMap } = await fetchConnectionPropertyMap(
        context,
        [{
          id: 'connection1',
          role: 'role1',
          company: 'company1',
          person: 'person1',
          source: 'source1'
        }, {
          id: 'connection2',
          role: 'role2',
          company: 'company2',
          person: 'person2',
          source: 'source2'
        }, {
          id: 'connection2',
          role: 'role1',
          company: 'company1',
          person: 'person4',
          source: 'source1'
        }]
      )

      expect(personMap).to.deep.equal({
        person1: {
          id: 'person1'
        },
        person2: {
          id: 'person2'
        },
        person4: {
          id: 'person4'
        }
      })
    })

    it('should fetch a map of sources', async () => {
      const { sourceMap } = await fetchConnectionPropertyMap(
        context,
        [{
          id: 'connection1',
          role: 'role1',
          company: 'company1',
          person: 'person1',
          source: 'source1'
        }, {
          id: 'connection2',
          role: 'role2',
          company: 'company2',
          person: 'person2',
          source: 'source2'
        }, {
          id: 'connection2',
          role: 'role1',
          company: 'company1',
          person: 'person4',
          source: 'source1'
        }]
      )

      expect(sourceMap).to.deep.equal({
        source1: {
          id: 'source1'
        },
        source2: {
          id: 'source2'
        }
      })
    })
  })

  describe('when the connection doesn\'t have a role', () => {
    it('should not error', async () => {
      const { roleMap } = await fetchConnectionPropertyMap(
        context,
        [db.connections[3]]
      )

      expect(roleMap).to.deep.equal({})
    })
  })

  describe('when the connection doesn\'t have a company', () => {
    it('should not error', async () => {
      const { companyMap } = await fetchConnectionPropertyMap(
        context,
        [db.connections[3]]
      )

      expect(companyMap).to.deep.equal({})
    })
  })
})
