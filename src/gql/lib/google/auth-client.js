const { auth } = require('googleapis')

const authClient = new auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

module.exports = authClient
