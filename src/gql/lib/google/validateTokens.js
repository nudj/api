const request = require('@nudj/library/request')
const { logger } = require('@nudj/library')
const authClient = require('./authClient')

const refreshAccessToken = (refreshToken) => {
  authClient.setCredentials({
    refresh_token: refreshToken
  })

  return new Promise((resolve, reject) => {
    authClient.refreshAccessToken((error, tokens) => {
      if (error) {
        logger('error', 'Google authentication error', error)
        return reject(error)
      }
      resolve({ accessToken: tokens.access_token, refreshed: true })
    })
  })
}

module.exports = async (accessToken, refreshToken) => {
  try {
    await request(`/oauth2/v1/tokeninfo?access_token=${accessToken}`, {
      baseURL: 'https://www.googleapis.com/'
    })
    return { accessToken, refreshed: false }
  } catch (error) {
    logger('info', 'Error with Google AccessToken:', error)
    return refreshAccessToken(refreshToken)
  }
}
