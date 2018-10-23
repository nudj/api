const { ManagementClient, AuthenticationClient } = require('auth0')
const promiseSerial = require('promise-serial')

const { store: setupStore } = require('../../gql/adaptors/mysql')

function fetchAuthenticationToken () {
  const auth0 = new AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET
  })

  return new Promise((resolve, reject) => {
    auth0.clientCredentialsGrant({
      audience: 'https://nudj.eu.auth0.com/api/v2/',
      scope: 'read:users'
    }, (error, response) => {
      return error ? reject(error) : resolve(response.access_token)
    })
  })
}

async function action ({ sql }) {
  const store = setupStore({ db: sql })
  const authToken = await fetchAuthenticationToken()
  const management = new ManagementClient({
    token: authToken,
    domain: process.env.AUTH0_DOMAIN
  })

  const users = await management.getUsers()
  // Filters out non-sign-up users that don't have an email, E.g. nudj main user
  const userEmails = users.map(user => user.email).filter(Boolean)

  await promiseSerial(userEmails.map(email => async () => {
    const person = await store.readOne({
      type: 'people',
      filters: { email }
    })

    if (!person) return null

    return store.update({
      type: 'people',
      id: person.id,
      data: {
        acceptedTerms: true
      }
    })
  }))
}

module.exports = action
