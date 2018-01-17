const nock = require('nock')
const { Base64 } = require('js-base64')
const gmailThread = require('./mock-gmail-thread')
const {
  validAccessToken,
  invalidAccessToken,
  validThreadId,
  invalidThreadId,
  refreshToken
} = require('./mock-tokens')

const tokenRefresh = nock('https://accounts.google.com')
const tokenValidation = nock('https://www.googleapis.com/')
const validAccessTokenGoogle = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: `Bearer ${validAccessToken}`
  }
})
const invalidAccessTokenGoogle = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: `Bearer ${invalidAccessToken}`
  }
})

const mockSendResponse = (uri, encodedBody) => {
  // Decode raw encoded email body
  const decodedBody = Base64.decode(encodedBody.raw)

  // Extract message from decoded string
  const body = decodedBody
    .split(':')[decodedBody.split(':').length - 1] // Take last section
    .split('1.0')[1] // Take all after version number (body)
    .replace(/\r\n/g, '') // Remove surrounding line breaks

  const response = 'gmailSentResponse'
  const threadId = 'gmailThread'

  return [200, { response, threadId, body }]
}

const mockGmailSend = () => {
  validAccessTokenGoogle
    .post('/messages/send')
    .reply(mockSendResponse)
  invalidAccessTokenGoogle
    .post('/messages/send')
    .replyWithError('Invalid Access Token')
}

const mockThreadFetch = () => {
  validAccessTokenGoogle
    .get(`/threads/${validThreadId}`)
    .reply(200, gmailThread)
  validAccessTokenGoogle
    .get(`/threads/${invalidThreadId}`)
    .replyWithError('Invalid Thread ID')
  invalidAccessTokenGoogle
    .get(`/threads/${validThreadId}`)
    .replyWithError('Invalid Access Token')
}

const mockTokenValidation = () => {
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: validAccessToken })
    .reply(200)
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: invalidAccessToken })
    .reply(400)
}

const mockTokenRefresh = () => {
  tokenRefresh
    .post('/o/oauth2/token', `refresh_token=${refreshToken}&grant_type=refresh_token`)
    .reply(200, { access_token: validAccessToken })
  tokenRefresh
    .post('/o/oauth2/token')
    .replyWithError('Invalid Refresh Token')
}

module.exports = {
  mockThreadFetch,
  mockGmailSend,
  mockTokenRefresh,
  mockTokenValidation
}
