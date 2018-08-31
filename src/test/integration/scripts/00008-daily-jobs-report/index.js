/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const script = proxyquire('../../../../scripts/00008-daily-jobs-report', {
  'date-fns/sub_days': () => ({
    toISOString: () => '2000-01-01' // To set "yesterday's" timestamp
  })
})
const executeScript = (arg) => script({ db, arg })

describe('00008 Daily Jobs Report', () => {
  let consoleStub

  before(async () => {
    await setupCollections(db, [
      'companies',
      'events',
      'referrals',
      'jobs'
    ])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'jobs',
        data: [
          {
            _key: 'job1',
            title: 'winner',
            status: jobStatusTypes.PUBLISHED,
            company: 'company1'
          },
          {
            _key: 'job2',
            title: 'loser',
            status: jobStatusTypes.PUBLISHED,
            company: 'company2'
          },
          {
            _key: 'job3',
            title: 'drawer',
            status: jobStatusTypes.PUBLISHED,
            company: 'company1'
          },
          {
            _key: 'job4',
            title: 'non-participant',
            status: jobStatusTypes.DRAFT,
            company: 'company1'
          },
          {
            _key: 'job5',
            title: 'spectator',
            status: jobStatusTypes.DRAFT,
            company: 'company3'
          }
        ]
      },
      {
        name: 'events',
        data: [
          {
            _key: 'event1',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job1',
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'event2',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job2',
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'event3',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job1',
            created: '2000-01-01T20:33:54.927Z'
          },
          {
            _key: 'event4',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job1',
            created: '2012-01-01T20:33:54.927Z'
          }
        ]
      },
      {
        name: 'referrals',
        data: [
          {
            _key: 'referral1',
            job: 'job1',
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'referral2',
            job: 'job1',
            created: '2012-01-01T19:33:54.927Z'
          },
          {
            _key: 'referral3',
            job: 'job2',
            created: '2000-01-01T19:33:54.927Z'
          }
        ]
      },
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            name: 'Cats Incorporated',
            created: '2000-01-01T19:33:54.927Z'
          },
          {
            _key: 'company2',
            name: 'Dogs Incorporated',
            created: '2012-01-01T19:33:54.927Z'
          },
          {
            _key: 'company3',
            client: true,
            name: 'Goldfish Incorporated',
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

    it('logs out statistics for individual jobs', async () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal('"date","company","title","view count","referral count"')
      expect(csvLines[1]).to.equal('"2000-01-01","Dogs Incorporated","loser",1,1')
    })

    it('logs out a total for a company\'s jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[2]).to.equal('"2000-01-01","Dogs Incorporated","Total",1,1')
      expect(csvLines[5]).to.equal('"2000-01-01","Cats Incorporated","Total",2,1')
    })

    it('logs out for companies that have no published jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[6]).to.equal('"2000-01-01","Goldfish Incorporated","Total",0,0')
    })

    it('logs out a total for all jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[7]).to.equal('"2000-01-01","Overall","Total",6,4')
    })
  })

  describe('when date is specified', () => {
    beforeEach(async () => {
      consoleStub = sinon.stub(console, 'log')
      await executeScript('2012-01-01')
      consoleStub.restore()
    })

    it('logs out statistics for individual jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal('"date","company","title","view count","referral count"')
      expect(csvLines[1]).to.equal('"2012-01-01","Dogs Incorporated","loser",0,0')
    })

    it('logs out a total for a company\'s jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[2]).to.equal('"2012-01-01","Dogs Incorporated","Total",0,0')
      expect(csvLines[5]).to.equal('"2012-01-01","Cats Incorporated","Total",1,1')
    })

    it('logs out for companies that have no published jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[6]).to.equal('"2012-01-01","Goldfish Incorporated","Total",0,0')
    })

    it('logs out a total for all jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[7]).to.equal('"2012-01-01","Overall","Total",2,2')
    })

    describe('when timestamp is incorrectly formatted', () => {
      it('throws an exception', () => {
        expect(executeScript('01/2018')).to.eventually.be.rejectedWith(
          'Please format your date arg using yyyy-mm-dd. E.g., 1994-04-23'
        )
      })
    })
  })
})
