const nock = require('nock')

const mockClearbitRequests = (responses = {}) => {
  const {
    getResponse = 'OK',
    postResponse = 'OK'
  } = responses

  nock('https://company-stream.clearbit.com')
    .persist()
    .filteringRequestBody(() => true)
    .post(() => true)
    .reply(200, getResponse)
  nock('https://company-stream.clearbit.com')
    .persist()
    .filteringRequestBody(() => true)
    .get(() => true)
    .reply(200, postResponse)
}

module.exports = mockClearbitRequests
