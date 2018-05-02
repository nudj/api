/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')
const flatten = require('lodash/flatten')

const createJob = require('../../../../gql/lib/helpers/create-job')

const createStub = sinon.stub()
const readOneStub = sinon.stub()
const readOneOrCreateStub = sinon.stub()
const context = {
  sql: {
    create: createStub,
    readOne: readOneStub,
    readOneOrCreate: readOneOrCreateStub
  }
}

const fetchStubCalls = (stub) => {
  const { args } = stub.getCalls()[0].proxy
  return flatten(args)
}

describe('createJob', () => {
  beforeEach(() => {
    createStub.reset()
    readOneStub.reset()
    readOneOrCreateStub.reset()
  })

  it('returns a job created with given data', async () => {
    const jobCreatedResponse = 'JOB_CREATED'
    createStub.returns(jobCreatedResponse)
    const company = { id: 'company1' }
    const data = {
      title: 'Lead Engineer',
      location: 'London',
      remuneration: '£1000'
    }
    const job = await createJob(context, company, data)
    expect(job).to.equal(jobCreatedResponse)
  })

  it('generates a unique job slug', async () => {
    const company = { id: 'company1' }
    const data = {
      title: 'Lead Engineer',
      location: 'London',
      remuneration: '£1000'
    }
    await createJob(context, company, data)

    const calls = fetchStubCalls(createStub)
    expect(calls[0].data.slug).to.equal('lead-engineer')
  })

  it('creates provided tags', async () => {
    createStub.returns({ id: '1' })
    readOneOrCreateStub.returns({ id: '2' })
    const company = { id: 'company1' }
    const data = {
      title: 'Lead Engineer',
      location: 'London',
      tags: ['hey there'],
      remuneration: '£1000'
    }

    await createJob(context, company, data)

    const readOrCreateCalls = fetchStubCalls(readOneOrCreateStub)
    const createCalls = fetchStubCalls(createStub)
    expect(readOrCreateCalls[0]).to.deep.equal({
      type: 'tags',
      filters: {
        name: 'hey there',
        type: 'EXPERTISE'
      },
      data: {
        name: 'hey there',
        type: 'EXPERTISE'
      }
    })
    expect(createCalls[1]).to.deep.equal({
      type: 'jobTags',
      data: {
        job: '1',
        source: 'NUDJ',
        tag: '2'
      }
    })
  })
})
