/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Job.tags', () => {
  it('should fetch filtered tags', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      jobTags: [
        {
          id: 'jobTag1',
          job: 'job1',
          tag: 'tag1'
        },
        {
          id: 'jobTag2',
          job: 'job1',
          tag: 'tag2'
        }
      ],
      tags: [
        {
          id: 'tag1',
          name: 'First'
        },
        {
          id: 'tag2',
          name: 'Second'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          tags
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          tags: [
            'First',
            'Second'
          ]
        }
      }
    })
  })

  it('should return an empty array if no matches', async () => {
    const db = {
      jobs: [
        {
          id: 'job1'
        }
      ],
      tags: [
        {
          id: 'tag1',
          name: 'First'
        },
        {
          id: 'tag2',
          name: 'Second'
        }
      ]
    }
    const operation = `
      query {
        job (id: "job1") {
          tags
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        job: {
          tags: []
        }
      }
    })
  })
})
