/* eslint-env mocha */
const { hnock: nock } = require('heisennock')
const fs = require('fs')
const path = require('path')

const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const script = require('../../../../scripts/00005-send-mass-invitations')
const executeScript = (arg) => script({ db, arg })
const { fetchAll } = require('../../../../lib')

function mockExternalRequests () {
  const mailgunNock = nock('https://api.mailgun.net')
  const intercomNock = nock('https://api.intercom.io')
  return {
    mailgun: {
      post: {
        messages: mailgunNock.post(/messages$/).reply(200, 'OK')
      }
    },
    intercom: {
      get: {
        users: intercomNock.get(/^\/users/).reply(200, null),
        companies: intercomNock.get(/^\/companies/).reply(200, { tags: {} })
      },
      post: {
        users: intercomNock.post(/^\/users/).reply(200, { tags: {} }),
        companies: intercomNock.post(/^\/companies/).reply(200, { tags: {} }),
        tags: intercomNock.post(/^\/tags/).reply(200, { tags: {} }),
        events: intercomNock.post(/^\/events/).reply(200, { tags: {} })
      }
    }
  }
}

const getFullPathFor = relativePath => path.join(__dirname, relativePath)
const importCsvPath = getFullPathFor('../../../../scripts/00005-send-mass-invitations/team.csv')

describe('00005 Send Mass Invitations', () => {
  let nocked

  before(async () => {
    await setupCollections(db, ['companies', 'hirers', 'people', 'jobs'])
  })

  beforeEach(async () => {
    nocked = mockExternalRequests()
    await populateCollections(db, [
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            client: true,
            name: 'Company One'
          },
          {
            _key: 'company2',
            client: true,
            name: 'Company Two'
          }
        ]
      },
      {
        name: 'hirers',
        data: [
          {
            _key: 'hirer1',
            person: 'person1',
            company: 'company1'
          },
          {
            _key: 'hirer2',
            person: 'person3',
            company: 'company1'
          },
          {
            _key: 'hirer3',
            person: 'person4',
            company: 'company2'
          }
        ]
      },
      {
        name: 'people',
        data: [
          {
            _key: 'person1',
            firstName: 'User',
            lastName: 'Person',
            email: 'user@person.tld'
          },
          {
            _key: 'person2',
            firstName: 'Test',
            lastName: 'Person',
            email: 'existing@person.tld'
          },
          {
            _key: 'person3',
            firstName: 'Existing',
            lastName: 'Hirer1',
            email: 'existing-hirer@company1.tld'
          },
          {
            _key: 'person4',
            firstName: 'Existing',
            lastName: 'Hirer2',
            email: 'existing-hirer@company2.tld'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    nock.cleanAll()
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when person does not exist', () => {
    beforeEach(async () => {
      fs.copyFileSync(getFullPathFor('001-new-person.csv'), importCsvPath)
      await executeScript('person1')
    })

    it('sends an email to the invited members', async () => {
      expect(nocked.mailgun.post.messages.callCount).to.equal(1)
    })

    it('creates the user in intercom', async () => {
      expect(nocked.intercom.post.users.callCount).to.equal(1)
    })

    it('logs the event to intercom', async () => {
      expect(nocked.intercom.post.events.callCount).to.equal(2)
    })
  })

  describe('when person exists but the hirer does not', () => {
    beforeEach(async () => {
      fs.copyFileSync(getFullPathFor('002-existing-person.csv'), importCsvPath)
      await executeScript('person1')
    })

    it('sends an email to the invited members', async () => {
      expect(nocked.mailgun.post.messages.callCount).to.equal(1)
    })

    it('creates the user in intercom', async () => {
      expect(nocked.intercom.post.users.callCount).to.equal(1)
    })

    it('logs the event to intercom', async () => {
      expect(nocked.intercom.post.events.callCount).to.equal(2)
    })
  })

  describe('when person and hirer exist', () => {
    beforeEach(async () => {
      fs.copyFileSync(getFullPathFor('003-existing-hirer.csv'), importCsvPath)
      await executeScript('person1')
    })

    it('sends an email to the invited members', async () => {
      expect(nocked.mailgun.post.messages.callCount).to.equal(1)
    })

    it('creates the user in intercom', async () => {
      expect(nocked.intercom.post.users.callCount).to.equal(1)
    })

    it('logs the event to intercom', async () => {
      expect(nocked.intercom.post.events.callCount).to.equal(2)
    })
  })

  describe('when person and hirer exist for different company', () => {
    beforeEach(async () => {
      fs.copyFileSync(getFullPathFor('004-another-company.csv'), importCsvPath)
    })

    it('throws error if hirer belongs to another company', async () => {
      return expect(executeScript('person1')).to.be.rejected()
    })

    it('does not create a new hirer', async () => {
      try {
        await executeScript('person1')
        throw new Error()
      } catch (error) {
        const hirers = await fetchAll(db, 'hirers')
        expect(hirers).to.have.length(3)
      }
    })

    it('does not send any emails', async () => {
      expect(nocked.mailgun.post.messages.callCount).to.equal(0)
    })

    it('does not create a user in intercom', async () => {
      expect(nocked.intercom.post.users.callCount).to.equal(0)
    })

    it('does not log the event to intercom', async () => {
      expect(nocked.intercom.post.events.callCount).to.equal(0)
    })
  })
})
