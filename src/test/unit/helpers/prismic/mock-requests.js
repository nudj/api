const nock = require('nock')
const qs = require('qs')

const mockPrismicRequests = stub => {
  nock('https://nudj-hirer.prismic.io')
    .persist()
    .filteringRequestBody(body => {
      stub(qs.parse(body))
      return true
    })
    .post(() => true)
    .reply(200, 'OK')
  nock('https://nudj-hirer.prismic.io')
    .persist()
    .filteringRequestBody(body => {
      stub(qs.parse(body))
      return true
    })
    .get(() => true)
    .reply(200, {
      results: [{
        type: 'mock',
        data: {
          mock: {}
        }
      }],
      forms: {
        everything: {
          action: 'https://nudj-hirer.prismic.io',
          fields: { ref: 1, q: {} }
        }
      },
      master: { ref: {} },
      refs: [{ isMasterRef: true, ref: {} }]
    })
}

module.exports = mockPrismicRequests
