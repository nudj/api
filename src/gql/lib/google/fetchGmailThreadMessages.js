const google = require('googleapis')
const { logger } = require('@nudj/library')

const fetchAccountTokens = require('./fetchAccountTokens')
const authClient = require('./authClient')

const gmail = google.gmail('v1')

module.exports = async ({ context, conversation }) => {
  const { threadId, person } = conversation
  const { accessToken } = await fetchAccountTokens(context, { id: person })

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
        logger.log('error', 'Error retrieving Gmail thread', error)
        return reject(error)
      }
      resolve(response.messages)
    })
  })
}
