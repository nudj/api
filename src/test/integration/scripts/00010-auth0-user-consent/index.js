/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const {
  db,
  setupCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const FAKE_ACCESS_TOKEN = 'FAKE_ACCESS_TOKEN'
const managementClientStub = sinon.stub()
const authenticationClientStub = sinon.stub()
class fakeManagementClient {
  constructor (config) {
    managementClientStub(config)
  }

  getUsers () {
    managementClientStub('getUsers')
    return [
      { username: 'nudj' },
      { email: 'user1@email.tld' },
      { email: 'user2@email.tld' },
      { email: 'user3@email.tld' },
      { email: 'user4@email.tld' }
    ]
  }
}

class fakeAuthenticationClient {
  clientCredentialsGrant (config, callback) {
    authenticationClientStub(config.token)
    callback(null, { access_token: FAKE_ACCESS_TOKEN })
  }
}

let script = proxyquire('../../../../scripts/00010-auth0-user-consent', {
  'auth0': {
    ManagementClient: fakeManagementClient,
    AuthenticationClient: fakeAuthenticationClient
  }
})
const executeScript = () => script({ db })

describe('00010 Auth0 User Content', () => {
  before(async () => {
    await setupCollections(db, ['people'])
  })

  beforeEach(async () => {
    managementClientStub.reset()
    authenticationClientStub.reset()
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('calls authentication endpoint to fetch an access token', async () => {
    await executeScript({ db })
    expect(authenticationClientStub).to.have.been.called()
  })

  it('supplies the access token to the auth0 API', async () => {
    await executeScript({ db })
    expect(managementClientStub).to.have.been.calledWith({
      token: FAKE_ACCESS_TOKEN,
      domain: process.env.AUTH0_DOMAIN
    })
  })

  it('fetches the users from the auth0 API', async () => {
    await executeScript({ db })
    expect(managementClientStub).to.have.been.calledWith('getUsers')
  })

  describe('when fetched email exists as a person', () => {
    let readOneStub = sinon.stub()
    let updateStub = sinon.stub()
    beforeEach(() => {
      script = proxyquire('../../../../scripts/00010-auth0-user-consent', {
        'auth0': {
          ManagementClient: fakeManagementClient,
          AuthenticationClient: fakeAuthenticationClient
        },
        '../../gql/adaptors/arango': {
          store: () => ({
            readOne: readOneStub,
            update: updateStub
          })
        }
      })
    })
    it('updates the person with `acceptedTerms: true`', async () => {
      readOneStub.returns({ id: 'stubPerson1' })
      await executeScript({ db })

      expect(readOneStub).to.have.been.calledWith({
        type: 'people',
        filters: { email: 'user1@email.tld' }
      })
      expect(updateStub).to.have.been.calledWith({
        type: 'people',
        id: 'stubPerson1',
        data: {
          acceptedTerms: true
        }
      })
    })
  })

  describe('when fetched email does not exist as a person', () => {
    let readOneStub = sinon.stub()
    let updateStub = sinon.stub()
    beforeEach(() => {
      script = proxyquire('../../../../scripts/00010-auth0-user-consent', {
        'auth0': {
          ManagementClient: fakeManagementClient,
          AuthenticationClient: fakeAuthenticationClient
        },
        '../../gql/adaptors/arango': {
          store: () => ({
            readOne: readOneStub,
            update: updateStub
          })
        }
      })
    })

    it('does not update the person', async () => {
      readOneStub.returns(undefined)
      await executeScript({ db })

      expect(readOneStub).to.have.been.calledWith({
        type: 'people',
        filters: { email: 'user1@email.tld' }
      })
      expect(updateStub).to.not.have.been.called()
    })
  })
})
