const google = require('googleapis')
const striptags = require('striptags')
const { Base64 } = require('js-base64')
const { emailBuilder } = require('@nudj/library/server')
const { logger } = require('@nudj/library')

const fetchAccountTokens = require('./fetch-account-tokens')
const authClient = require('./auth-client')

const gmail = google.gmail('v1')

const formatBody = (message) => {
  // Emulates Gmail HTML patterns for line breaks
  const body = striptags(message)
    .replace(/\n\n/g, '<div><br></div><div>')
    .replace(/\n/g, '<div>')

  // Counts number of closing tags to apply
  const closedTags = (body.match(/<\/div>/g) || [])
  const endTags = (body.match(/<div>/g) || [])
  closedTags.forEach(() => endTags.pop())

  return body + endTags.map(() => '</div>').join('')
}

module.exports = async ({ context, email, person, threadId }) => {
  email.body = formatBody(email.body) // Emulates Gmail formatting

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
