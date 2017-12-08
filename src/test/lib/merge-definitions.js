/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { mergeDefinitions } = require('../../gql/lib')

describe('mergeDefinitions', () => {
  it('should concat the typeDefs', () => {
    expect(mergeDefinitions(
      {
        typeDefs: [1, 2],
        resolvers: {}
      },
      {
        typeDefs: [3, 4],
        resolvers: {}
      }
    )).to.deep.equal({
      typeDefs: [1, 2, 3, 4],
      resolvers: {}
    })
  })

  it('should handle missing typeDefs', () => {
    expect(mergeDefinitions(
      {
        typeDefs: [1, 2],
        resolvers: {}
      },
      {
        resolvers: {}
      }
    )).to.deep.equal({
      typeDefs: [1, 2],
      resolvers: {}
    })
  })

  it('should deep merge the resolvers', () => {
    expect(mergeDefinitions(
      {
        typeDefs: [],
        resolvers: {
          key1: 'value1',
          key3: {
            key4: 'value4'
          }
        }
      },
      {
        typeDefs: [],
        resolvers: {
          key2: 'value2',
          key3: {
            key5: 'value5'
          }
        }
      }
    )).to.deep.equal({
      typeDefs: [],
      resolvers: {
        key1: 'value1',
        key2: 'value2',
        key3: {
          key4: 'value4',
          key5: 'value5'
        }
      }
    })
  })

  it('should handle missing resolvers', () => {
    expect(mergeDefinitions(
      {
        typeDefs: [],
        resolvers: {
          key1: 'value1',
          key3: {
            key4: 'value4'
          }
        }
      },
      {
        typeDefs: []
      }
    )).to.deep.equal({
      typeDefs: [],
      resolvers: {
        key1: 'value1',
        key3: {
          key4: 'value4'
        }
      }
    })
  })
})
