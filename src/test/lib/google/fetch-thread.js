/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const fetchThread = require('../../../gql/lib/google/fetch-thread')
const { mockThreadFetch } = require('../../helpers/google/mock-requests')
const gmailThread = require('../../helpers/google/mock-gmail-thread')
const {
  validAccessToken,
  invalidAccessToken,
  validThreadId,
  invalidThreadId
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect

describe('Google.fetchThread', () => {
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
    expect(response).to.deep.equal(gmailThread)
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
