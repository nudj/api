/* eslint-env mocha */
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const {
  sql,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const script = proxyquire('../../../../scripts/00008-weekly-jobs-report', {
  'date-fns/sub_days': () => ({
    toISOString: () => '2000-01-04' // To set "yesterday's" timestamp
  })
})
const executeScript = arg => script({ db: sql, arg })

const csvHeaders = [
  '"date"',
  '"company"',
  '"title"',
  '"views"',
  '"referral links"',
  '"applications"',
  '""',
  '"lifetime views"',
  '"lifetime referral links"',
  '"lifetime applications"'
].join(',')

describe('00008 Weekly Jobs Report', () => {
  let consoleStub

  before(async () => {
    await setupCollections(sql, [
      'companies',
      'events',
      'referrals',
      'jobs',
      'applications'
    ])
  })

  beforeEach(async () => {
    await populateCollections(sql, [
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
            created: '2000-01-04T19:33:54.927Z' // Tuesday
          },
          {
            _key: 'event2',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job2',
            created: '2000-01-05T19:33:54.927Z' // Wednesday
          },
          {
            _key: 'event3',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job1',
            created: '2000-01-06T20:33:54.927Z' // Thursday
          },
          {
            _key: 'event4',
            entityType: 'jobs',
            eventType: 'viewed',
            entityId: 'job1',
            created: '2000-01-10T20:33:54.927Z' // Next week
          }
        ]
      },
      {
        name: 'referrals',
        data: [
          {
            _key: 'referral1',
            job: 'job1',
            created: '2000-01-04T19:33:54.927Z'
          },
          {
            _key: 'referral2',
            job: 'job1',
            created: '2000-01-10T19:33:54.927Z'
          },
          {
            _key: 'referral3',
            job: 'job2',
            created: '2000-01-07T19:33:54.927Z'
          }
        ]
      },
      {
        name: 'companies',
        data: [
          {
            _key: 'company1',
            name: 'Cats Incorporated',
            created: '2000-01-04T19:33:54.927Z'
          },
          {
            _key: 'company2',
            name: 'Dogs Incorporated',
            created: '2000-01-10T19:33:54.927Z'
          },
          {
            _key: 'company3',
            client: true,
            name: 'Goldfish Incorporated',
            created: '2000-01-10T19:33:54.927Z'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    consoleStub.reset()
    await truncateCollections(sql)
  })

  after(async () => {
    await teardownCollections(sql)
  })

  describe('when date is not specified', () => {
    beforeEach(async () => {
      consoleStub = sinon.stub()
      await executeScript()
      consoleStub.restore()
    })

    it('logs out statistics for individual jobs', async () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal(csvHeaders)
      expect(csvLines[1]).to.equal(
        '"Week starting 2000-01-02","Dogs Incorporated","loser",1,1,0,,1,1,0'
      )
    })

    it('logs out a total for a company\'s jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[2]).to.equal(',"Dogs Incorporated","Total",1,1,0,,1,1,0')
      expect(csvLines[6]).to.equal(',"Cats Incorporated","Total",2,1,0,,2,1,0')
    })

    it('logs out for companies that have no published jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[8]).to.equal(',"Goldfish Incorporated","Total",0,0,0,,0,0,0')
    })

    it('logs out a total for all jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[10]).to.equal(',"Overall","Total",3,2,0,,3,2,0')
    })
  })

  describe('when date is specified', () => {
    beforeEach(async () => {
      consoleStub = sinon.stub()
      await executeScript('2000-01-10')
      consoleStub.restore()
    })

    it('logs out statistics for individual jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[0]).to.equal(csvHeaders)
      expect(csvLines[1]).to.equal(
        '"Week starting 2000-01-09","Dogs Incorporated","loser",0,0,0,,1,1,0'
      )
    })

    it('logs out a total for a company\'s jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[2]).to.equal(',"Dogs Incorporated","Total",0,0,0,,1,1,0')
      expect(csvLines[6]).to.equal(',"Cats Incorporated","Total",1,1,0,,3,2,0')
    })

    it('logs out for companies that have no published jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[8]).to.equal(',"Goldfish Incorporated","Total",0,0,0,,0,0,0')
    })

    it('logs out a total for all jobs', () => {
      const csvLines = consoleStub.args[0][0].split('\n')

      expect(consoleStub).to.have.been.called()
      expect(csvLines[10]).to.equal(',"Overall","Total",1,1,0,,4,3,0')
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
