const google = require('googleapis')
const { Base64 } = require('js-base64')
const { emailBuilder } = require('@nudj/library/server')
const { logger } = require('@nudj/library')

const fetchAccountTokens = require('./fetchAccountTokens')
const authClient = require('./authClient')

const gmail = google.gmail('v1')

module.exports = async ({ context, email, person, threadId }) => {
  const { accessToken } = await fetchAccountTokens(context, person)
  const mimeEmail = emailBuilder(email)
  const base64EncodedEmail = Base64.encodeURI(mimeEmail)
  authClient.setCredentials({
    access_token: accessToken
  })

  return new Promise((resolve, reject) => {
    gmail.users.messages.send({
      auth: authClient,
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
