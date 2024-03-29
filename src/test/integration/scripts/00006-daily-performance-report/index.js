/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const script = proxyquire('../../../../scripts/00006-daily-performance-report', {
  'date-fns/sub_days': () => ({
    toISOString: () => '2000-01-01' // To set "yesterday's" timestamp
  })
})
const executeScript = (arg) => script({ db, arg })

describe('00006 Daily Performance Report', () => {
  let consoleStub

  before(async () => {
    await setupCollections(db, [
      'companies',
      'applications',
      'referrals',
      'jobs',
      'surveyAnswers'
    ])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            client: true,
            created: '2000-01-01T15:33:54.927Z'
          },
          {
            _key: 'company2',
            client: true,
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'company3',
            client: false,
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'company4',
            client: true,
            created: '2012-01-01T15:33:54.927Z'
          }
        ]
      },
      {
        name: 'jobs',
        data: [
          {
            _key: 'job1',
            created: '2000-01-01T15:33:54.927Z'
          },
          {
            _key: 'job2',
            created: '2012-01-01T15:33:54.927Z'
          },
          {
            _key: 'job3',
            created: '2000-01-01T19:33:54.927Z'
          }
        ]
      },
      {
        name: 'applications',
        data: [
          {
            _key: 'application1',
            created: '2012-01-01T15:33:54.927Z'
          },
          {
            _key: 'application2',
            created: '2012-01-01T15:33:54.927Z'
          },
          {
            _key: 'application3',
            created: '2000-01-01T19:33:54.927Z'
          }
        ]
      },
      {
        name: 'referrals',
        data: [
          {
            _key: 'referral1',
            created: '2000-01-01T15:33:54.927Z'
          },
          {
            _key: 'referral2',
            created: '2012-01-01T15:33:54.927Z'
          },
          {
            _key: 'referral3',
            created: '2012-01-01T19:33:54.927Z'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    consoleStub.reset()
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('when date is not specified', () => {
    beforeEach(async () => {
      consoleStub = sinon.stub(console, 'log')
      await executeScript()
      consoleStub.restore()
    })

    it('fetches the data from the previous day', async () => {
      const csvLines = consoleStub.args[0][0].split('\n')
      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal(
        '"New companies","New jobs","New applications","New referrals","Surveys started","Demos booked","Applicants hired"'
      )
      // 2 companies, 2 jobs, 1 application + 1 Survey started
      expect(csvLines[1]).to.equal('2,2,1,1,0,,')
    })
  })

  describe('when date is specified', () => {
    it('fetches the data from the specified day', async () => {
      consoleStub = sinon.stub(console, 'log')
      await executeScript('2012-01-01')
      consoleStub.restore()

      const csvLines = consoleStub.args[0][0].split('\n')
      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal(
        '"New companies","New jobs","New applications","New referrals","Surveys started","Demos booked","Applicants hired"'
      )
      // 1 company, 1 job, 2 applications + 2 Surveys started
      expect(csvLines[1]).to.equal('1,1,2,2,0,,')
    })

    describe('when the specified date is incorrectly formatted', () => {
      it('throws an exception', async () => {
        expect(executeScript('01/2012')).to.eventually.be.rejectedWith(
          'Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23'
        )
      })
    })
  })
})
