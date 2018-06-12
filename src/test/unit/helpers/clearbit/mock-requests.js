const nock = require('nock')

const defaultGetResponse = [200, 'OK']
const defaultPostResponse = [200, 'OK']

const mockClearbitRequests = (
  getResponse = defaultGetResponse,
  postResponse = defaultPostResponse,
) => {
  nock('https://company-stream.clearbit.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json'
    })
    .filteringRequestBody(() => true)
    .get(() => true)
    .reply(...getResponse)
  nock('https://company-stream.clearbit.com')
    .persist()
    .defaultReplyHeaders({
      'Content-Type': 'application/json'
    })
    .filteringRequestBody(() => true)
    .post(() => true)
    .reply(...postResponse)
}

module.exports = mockClearbitRequests
