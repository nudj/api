const google = require('googleapis')
const { Base64 } = require('js-base64')
const { emailBuilder } = require('@nudj/library/server')
const request = require('@nudj/library/request')
const { logger } = require('@nudj/library')

const gmail = google.gmail('v1')
const { OAuth2 } = google.auth
const oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_AUTH_CALLBACK)

const validateTokens = async (accessToken, refreshToken) => {
  try {
    await request(`/oauth2/v1/tokeninfo?access_token=${accessToken}`, {
      baseURL: 'https://www.googleapis.com/'
    })
    return { accessToken }
  } catch (error) {
    logger('info', 'Error with Google AccessToken:', error)
    return refreshAccessToken(refreshToken)
  }
}

const refreshAccessToken = (refreshToken) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })

  return new Promise((resolve, reject) => {
    oauth2Client.refreshAccessToken((error, tokens) => {
      if (error) {
        logger.log('error', 'Google authentication error', error)
        return reject(error)
      }
      resolve({ accessToken: tokens.access_token, refreshed: true })
    })
  })
}

const sendGmail = ({ email, accessToken, threadId }) => {
  const mimeEmail = emailBuilder(email)
  const base64EncodedEmail = Base64.encodeURI(mimeEmail)
  oauth2Client.setCredentials({
    access_token: accessToken
  })

  return new Promise((resolve, reject) => {
    gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
        threadId
      }
    }, (error, response) => {
      if (error) {
        logger('error', 'Error sending Gmail', error)
        return reject(error)
      }
      resolve(response)
    })
  })
}

module.exports = {
  sendGmail,
  validateTokens
}
