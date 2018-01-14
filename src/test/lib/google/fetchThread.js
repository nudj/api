/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const fetchThread = require('../../../gql/lib/google/fetchThread')

const expect = chai.expect
const validAccessTokenThreadFetch = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer VALID_ACCESS_TOKEN'
  }
})
const invalidAccessTokenThreadFetch = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer I_AINT_NO_STINKIN_TOKEN'
  }
})

const mockThreadFetch = () => {
  validAccessTokenThreadFetch
    .get('/threads/VALID_THREAD_ID')
    .reply(200, 'Thread Retrieved')
  validAccessTokenThreadFetch
    .get('/threads/BAD_THREAD_ID')
    .replyWithError('Invalid Thread ID')
  invalidAccessTokenThreadFetch
    .get('/threads/VALID_THREAD_ID')
    .replyWithError('Invalid Access Token')
}

describe('Google.fetchThread', () => {
  const validAccessToken = 'VALID_ACCESS_TOKEN'
  const invalidAccessToken = 'I_AINT_NO_STINKIN_TOKEN'
  const validThreadId = 'VALID_THREAD_ID'
  const invalidThreadId = 'BAD_THREAD_ID'

  nock.emitter.on('no match', function (req) {
    console.log('No match for request:', req)
  })

  beforeEach(() => {
    mockThreadFetch()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('fetches thread with valid threadId', async () => {
    const accessToken = validAccessToken
    const threadId = validThreadId
    const response = await fetchThread({ threadId, accessToken })
    expect(response).to.equal('Thread Retrieved')
  })

  it('errors with invalid threadId', async () => {
    const accessToken = validAccessToken
    const threadId = invalidThreadId
    await expect(
      fetchThread({ threadId, accessToken })
    ).to.be.rejectedWith('Invalid Thread ID')
  })

  it('errors with invalid accessToken', async () => {
    const accessToken = invalidAccessToken
    const threadId = validThreadId
    await expect(
      fetchThread({ threadId, accessToken })
    ).to.be.rejectedWith('Invalid Access Token')
  })
})
