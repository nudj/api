const google = require('googleapis')
const { logger } = require('@nudj/library')
const authClient = require('./auth-client')

const gmail = google.gmail('v1')

module.exports = async ({ threadId, accessToken }) => {
  authClient.setCredentials({
    access_token: accessToken
  })

  return new Promise((resolve, reject) => {
    gmail.users.threads.get({
      auth: authClient,
      userId: 'me',
      id: threadId
    }, (error, response) => {
      if (error) {
        logger('error', 'Error retrieving Gmail thread', error)
        return reject(error)
      }
      resolve(response)
    })
  })
}
